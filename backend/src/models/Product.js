const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Category = require('./Category');
const Supplier = require('./Supplier');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  minStock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 5
  }
}, {
  timestamps: true
});

Product.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });
Product.belongsTo(Supplier, { foreignKey: 'supplierId', as: 'supplier' });

module.exports = Product;
