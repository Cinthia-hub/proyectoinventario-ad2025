const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Supplier = require('../models/Supplier');
const { authMiddleware } = require('../middleware/auth');

// Get all products
router.get('/', authMiddleware, async (req, res) => {
  try {
    const products = await Product.findAll({
      include: [
        { model: Category, as: 'category' },
        { model: Supplier, as: 'supplier' }
      ]
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products', error: error.message });
  }
});

// Get single product
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [
        { model: Category, as: 'category' },
        { model: Supplier, as: 'supplier' }
      ]
    });
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching product', error: error.message });
  }
});

// Create product
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { code, name, description, price, stock, minStock, categoryId, supplierId } = req.body;

    if (!code || !name || price === undefined) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const existingProduct = await Product.findOne({ where: { code } });
    if (existingProduct) {
      return res.status(400).json({ message: 'Product code already exists' });
    }

    const product = await Product.create({
      code,
      name,
      description,
      price,
      stock: stock || 0,
      minStock: minStock || 5,
      categoryId,
      supplierId
    });

    const createdProduct = await Product.findByPk(product.id, {
      include: [
        { model: Category, as: 'category' },
        { model: Supplier, as: 'supplier' }
      ]
    });

    res.status(201).json({ message: 'Product created successfully', product: createdProduct });
  } catch (error) {
    res.status(500).json({ message: 'Error creating product', error: error.message });
  }
});

// Update product
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const { code, name, description, price, stock, minStock, categoryId, supplierId } = req.body;

    await product.update({
      code: code || product.code,
      name: name || product.name,
      description: description !== undefined ? description : product.description,
      price: price !== undefined ? price : product.price,
      stock: stock !== undefined ? stock : product.stock,
      minStock: minStock !== undefined ? minStock : product.minStock,
      categoryId: categoryId !== undefined ? categoryId : product.categoryId,
      supplierId: supplierId !== undefined ? supplierId : product.supplierId
    });

    const updatedProduct = await Product.findByPk(product.id, {
      include: [
        { model: Category, as: 'category' },
        { model: Supplier, as: 'supplier' }
      ]
    });

    res.json({ message: 'Product updated successfully', product: updatedProduct });
  } catch (error) {
    res.status(500).json({ message: 'Error updating product', error: error.message });
  }
});

// Delete product
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await product.destroy();
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting product', error: error.message });
  }
});

// Get low stock products
router.get('/reports/low-stock', authMiddleware, async (req, res) => {
  try {
    const sequelize = require('../config/database');
    const products = await Product.findAll({
      where: sequelize.literal('stock <= minStock'),
      include: [
        { model: Category, as: 'category' },
        { model: Supplier, as: 'supplier' }
      ]
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching low stock products', error: error.message });
  }
});

module.exports = router;
