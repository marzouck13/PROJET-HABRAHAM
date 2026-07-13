// Models/User.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    Id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    Name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    Email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true }
    },
    Password: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: ''
    },
    isEmailVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    isPhoneVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    isFullyVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    emailVerifiedAt: DataTypes.DATE,
    phoneVerifiedAt: DataTypes.DATE,
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    isSent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    timestamps: true,
    indexes: [
      { fields: ['Email'] },
      { fields: ['isSent'] }
    ]
  });

  User.associate = (models) => {
    User.hasMany(models.Number, { foreignKey: 'UserKey', as: 'Numbers' });
    User.hasMany(models.Transacs, { foreignKey: 'UserKey', as: 'Transactions' });
    User.hasMany(models.History, { foreignKey: 'UserKey', as: 'Histories' });
  };

  return User;
};