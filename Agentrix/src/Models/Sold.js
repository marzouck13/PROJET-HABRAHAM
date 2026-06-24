// models/Sold.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Sold = sequelize.define('Sold', {
    Id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    CurrentBalance: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0.00,
      allowNull: false
    },
    LastTransactionDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    isSent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    timestamps: true,
    indexes: [
      { fields: ['NumberKey'] },
      { fields: ['isSent'] }
    ]
  });

  Sold.associate = (models) => {
    Sold.belongsTo(models.Number, { foreignKey: 'NumberKey', as: 'Number' });
  };

  return Sold;
};