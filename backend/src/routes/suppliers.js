const express = require('express');
const router = express.Router();
const Supplier = require('../models/Supplier');
const { authMiddleware } = require('../middleware/auth');

// Get all suppliers
router.get('/', authMiddleware, async (req, res) => {
  try {
    const suppliers = await Supplier.findAll();
    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching suppliers', error: error.message });
  }
});

// Get single supplier
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const supplier = await Supplier.findByPk(req.params.id);
    
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }
    
    res.json(supplier);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching supplier', error: error.message });
  }
});

// Create supplier
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, contact, phone, email, address } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Please provide a supplier name' });
    }

    const supplier = await Supplier.create({ name, contact, phone, email, address });
    res.status(201).json({ message: 'Supplier created successfully', supplier });
  } catch (error) {
    res.status(500).json({ message: 'Error creating supplier', error: error.message });
  }
});

// Update supplier
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const supplier = await Supplier.findByPk(req.params.id);
    
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    const { name, contact, phone, email, address } = req.body;
    await supplier.update({ 
      name: name || supplier.name,
      contact: contact !== undefined ? contact : supplier.contact,
      phone: phone !== undefined ? phone : supplier.phone,
      email: email !== undefined ? email : supplier.email,
      address: address !== undefined ? address : supplier.address
    });

    res.json({ message: 'Supplier updated successfully', supplier });
  } catch (error) {
    res.status(500).json({ message: 'Error updating supplier', error: error.message });
  }
});

// Delete supplier
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const supplier = await Supplier.findByPk(req.params.id);
    
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    await supplier.destroy();
    res.json({ message: 'Supplier deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting supplier', error: error.message });
  }
});

module.exports = router;
