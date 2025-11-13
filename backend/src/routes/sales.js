const express = require('express');
const router = express.Router();
const Sale = require('../models/Sale');
const SaleItem = require('../models/SaleItem');
const Product = require('../models/Product');
const User = require('../models/User');
const { authMiddleware } = require('../middleware/auth');
const sequelize = require('../config/database');

// Get all sales
router.get('/', authMiddleware, async (req, res) => {
  try {
    const sales = await Sale.findAll({
      include: [
        { model: User, as: 'user', attributes: ['id', 'username'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(sales);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching sales', error: error.message });
  }
});

// Get single sale with items
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const sale = await Sale.findByPk(req.params.id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'username'] }
      ]
    });
    
    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }

    const items = await SaleItem.findAll({
      where: { saleId: sale.id },
      include: [
        { model: Product, as: 'product' }
      ]
    });
    
    res.json({ ...sale.toJSON(), items });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching sale', error: error.message });
  }
});

// Create sale (POS transaction)
router.post('/', authMiddleware, async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const { items, paymentMethod, notes } = req.body;

    if (!items || items.length === 0) {
      await t.rollback();
      return res.status(400).json({ message: 'Please provide sale items' });
    }

    let total = 0;
    const saleItems = [];

    // Validate all products and calculate total
    for (const item of items) {
      const product = await Product.findByPk(item.productId, { transaction: t });
      
      if (!product) {
        await t.rollback();
        return res.status(404).json({ message: `Product ${item.productId} not found` });
      }

      if (product.stock < item.quantity) {
        await t.rollback();
        return res.status(400).json({ 
          message: `Insufficient stock for product ${product.name}. Available: ${product.stock}` 
        });
      }

      const subtotal = parseFloat(product.price) * parseInt(item.quantity);
      total += subtotal;

      saleItems.push({
        productId: product.id,
        quantity: item.quantity,
        unitPrice: product.price,
        subtotal
      });

      // Update product stock
      await product.update(
        { stock: product.stock - item.quantity },
        { transaction: t }
      );
    }

    // Create sale
    const sale = await Sale.create({
      total,
      paymentMethod: paymentMethod || 'cash',
      notes,
      userId: req.user.id
    }, { transaction: t });

    // Create sale items
    for (const saleItem of saleItems) {
      await SaleItem.create({
        ...saleItem,
        saleId: sale.id
      }, { transaction: t });
    }

    await t.commit();

    // Fetch complete sale with items
    const createdSale = await Sale.findByPk(sale.id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'username'] }
      ]
    });

    const createdItems = await SaleItem.findAll({
      where: { saleId: sale.id },
      include: [
        { model: Product, as: 'product' }
      ]
    });

    res.status(201).json({ 
      message: 'Sale created successfully', 
      sale: { ...createdSale.toJSON(), items: createdItems }
    });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ message: 'Error creating sale', error: error.message });
  }
});

// Get sales reports
router.get('/reports/summary', authMiddleware, async (req, res) => {
  try {
    const { Op } = require('sequelize');
    const { startDate, endDate } = req.query;

    const whereClause = {};
    if (startDate && endDate) {
      whereClause.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    const sales = await Sale.findAll({
      where: whereClause,
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'totalSales'],
        [sequelize.fn('SUM', sequelize.col('total')), 'totalRevenue'],
        [sequelize.fn('AVG', sequelize.col('total')), 'averageSale']
      ]
    });

    res.json(sales[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error generating sales report', error: error.message });
  }
});

module.exports = router;
