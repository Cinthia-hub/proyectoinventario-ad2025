const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Sale = require('./Sale');
const Product = require('./Product');

const SaleItem = sequelize.define('SaleItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  unitPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  }
}, {
  timestamps: true
});

SaleItem.belongsTo(Sale, { foreignKey: 'saleId', as: 'sale' });
SaleItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

module.exports = SaleItem;
