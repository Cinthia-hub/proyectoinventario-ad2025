const express = require('express');
const router = express.Router();
const InventoryMovement = require('../models/InventoryMovement');
const Product = require('../models/Product');
const User = require('../models/User');
const { authMiddleware } = require('../middleware/auth');

// Get all inventory movements
router.get('/', authMiddleware, async (req, res) => {
  try {
    const movements = await InventoryMovement.findAll({
      include: [
        { model: Product, as: 'product' },
        { model: User, as: 'user', attributes: ['id', 'username'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(movements);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching inventory movements', error: error.message });
  }
});

// Get single inventory movement
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const movement = await InventoryMovement.findByPk(req.params.id, {
      include: [
        { model: Product, as: 'product' },
        { model: User, as: 'user', attributes: ['id', 'username'] }
      ]
    });
    
    if (!movement) {
      return res.status(404).json({ message: 'Inventory movement not found' });
    }
    
    res.json(movement);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching inventory movement', error: error.message });
  }
});

// Create inventory movement
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { productId, type, quantity, reason, notes } = req.body;

    if (!productId || !type || !quantity) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    if (!['entry', 'exit'].includes(type)) {
      return res.status(400).json({ message: 'Type must be either "entry" or "exit"' });
    }

    // Get product and update stock
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const newStock = type === 'entry' 
      ? product.stock + parseInt(quantity)
      : product.stock - parseInt(quantity);

    if (newStock < 0) {
      return res.status(400).json({ message: 'Insufficient stock for exit movement' });
    }

    await product.update({ stock: newStock });

    const movement = await InventoryMovement.create({
      productId,
      type,
      quantity,
      reason,
      notes,
      userId: req.user.id
    });

    const createdMovement = await InventoryMovement.findByPk(movement.id, {
      include: [
        { model: Product, as: 'product' },
        { model: User, as: 'user', attributes: ['id', 'username'] }
      ]
    });

    res.status(201).json({ message: 'Inventory movement created successfully', movement: createdMovement });
  } catch (error) {
    res.status(500).json({ message: 'Error creating inventory movement', error: error.message });
  }
});

// Get movements by product
router.get('/product/:productId', authMiddleware, async (req, res) => {
  try {
    const movements = await InventoryMovement.findAll({
      where: { productId: req.params.productId },
      include: [
        { model: Product, as: 'product' },
        { model: User, as: 'user', attributes: ['id', 'username'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(movements);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching product movements', error: error.message });
  }
});

module.exports = router;
