const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Sale = sequelize.define('Sale', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  paymentMethod: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'cash',
    validate: {
      isIn: [['cash', 'card', 'transfer']]
    }
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  timestamps: true
});

Sale.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = Sale;
