// Models/Number.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const Number = sequelize.define('Number', {
    Id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    PhoneNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    Reseau: {
      type: DataTypes.ENUM('MTN', 'MOOV', 'CELTIIS'),
      allowNull: false
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    verifiedAt: DataTypes.DATE,
    isSent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    timestamps: true,
    indexes: [
      { fields: ['PhoneNumber'] },
      { fields: ['Reseau'] },
      { fields: ['UserKey'] },
      { fields: ['isSent'] }
    ]
  });

  Number.associate = (models) => {
    Number.belongsTo(models.User, { foreignKey: 'UserKey', as: 'User' });
    Number.hasOne(models.Sold, { foreignKey: 'NumberKey', as: 'Sold' });
    Number.hasMany(models.Transacs, { foreignKey: 'NumberKey', as: 'Transactions' });
  };

  return Number;
};