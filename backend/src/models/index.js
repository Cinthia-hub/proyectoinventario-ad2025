const sequelize = require('../config/database');
const User = require('./User');
const Category = require('./Category');
const Supplier = require('./Supplier');
const Product = require('./Product');
const InventoryMovement = require('./InventoryMovement');
const Sale = require('./Sale');
const SaleItem = require('./SaleItem');

const models = {
  User,
  Category,
  Supplier,
  Product,
  InventoryMovement,
  Sale,
  SaleItem
};

const syncDatabase = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log('Database synchronized successfully');
  } catch (error) {
    console.error('Error synchronizing database:', error);
  }
};

module.exports = {
  sequelize,
  ...models,
  syncDatabase
};
