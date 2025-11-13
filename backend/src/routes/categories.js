const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const { authMiddleware } = require('../middleware/auth');

// Get all categories
router.get('/', authMiddleware, async (req, res) => {
  try {
    const categories = await Category.findAll();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching categories', error: error.message });
  }
});

// Get single category
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching category', error: error.message });
  }
});

// Create category
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Please provide a category name' });
    }

    const category = await Category.create({ name, description });
    res.status(201).json({ message: 'Category created successfully', category });
  } catch (error) {
    res.status(500).json({ message: 'Error creating category', error: error.message });
  }
});

// Update category
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const { name, description } = req.body;
    await category.update({ 
      name: name || category.name,
      description: description !== undefined ? description : category.description
    });

    res.json({ message: 'Category updated successfully', category });
  } catch (error) {
    res.status(500).json({ message: 'Error updating category', error: error.message });
  }
});

// Delete category
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    await category.destroy();
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting category', error: error.message });
  }
});

module.exports = router;
