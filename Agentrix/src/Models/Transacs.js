// models/Transacs.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Transacs = sequelize.define('Transacs', {
    Id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    Type: {
      type: DataTypes.ENUM('DEPOT', 'RETRAIT', 'COMMISSION', 'AJUSTEMENT'),
      allowNull: false
    },
    Amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      validate: { min: 0 }
    },
    BalanceBefore: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false
    },
    BalanceAfter: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false
    },
    Reseau: {
      type: DataTypes.ENUM('MTN', 'MOOV', 'CELTIIS'),
      allowNull: false
    },
    isSent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    timestamps: true,
    indexes: [
      { fields: ['UserKey', 'createdAt'] },
      { fields: ['NumberKey'] },
      { fields: ['Reseau', 'Type'] },
      { fields: ['Type', 'createdAt'] },
      { fields: ['isSent'] }
    ]
  });

  Transacs.associate = (models) => {
    Transacs.belongsTo(models.User, { foreignKey: 'UserKey', as: 'User' });
    Transacs.belongsTo(models.Number, { foreignKey: 'NumberKey', as: 'Number' });
    Transacs.hasOne(models.History, { foreignKey: 'TransacsKey', as: 'History' });
  };

  return Transacs;
};