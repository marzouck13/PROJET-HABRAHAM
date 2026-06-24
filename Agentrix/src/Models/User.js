// models/User.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
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
      allowNull: false
    },
    // Statuts de vérification
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
    // Dates de vérification
    emailVerifiedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    phoneVerifiedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
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
      { fields: ['isFullyVerified'] },
      { fields: ['isSent'] }
    ]
  });

  User.associate = (models) => {
    User.hasOne(models.OtpVerification, { foreignKey: 'UserKey', as: 'OtpVerification' });
    User.hasMany(models.Number, { foreignKey: 'UserKey', as: 'Numbers' });
    User.hasMany(models.Transacs, { foreignKey: 'UserKey', as: 'Transactions' });
    User.hasMany(models.History, { foreignKey: 'UserKey', as: 'Histories' });
  };

  return User;
};