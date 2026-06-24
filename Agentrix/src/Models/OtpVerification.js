// models/OtpVerification.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const OtpVerification = sequelize.define('OtpVerification', {
    Id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    // OTP pour email
    EmailOtp: {
      type: DataTypes.STRING(6),
      allowNull: false
    },
    EmailOtpExpiresAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    isEmailOtpUsed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    EmailOtpAttempts: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: { max: 3 }
    },
    
    // OTP pour téléphone
    PhoneOtp: {
      type: DataTypes.STRING(6),
      allowNull: false
    },
    PhoneOtpExpiresAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    isPhoneOtpUsed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    PhoneOtpAttempts: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: { max: 3 }
    },
    
    // Statut global
    isBothVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    verifiedAt: {
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
      { fields: ['UserKey'] },
      { fields: ['isBothVerified'] },
      { fields: ['EmailOtpExpiresAt'] },
      { fields: ['PhoneOtpExpiresAt'] },
      { fields: ['isSent'] }
    ]
  });

  OtpVerification.associate = (models) => {
    OtpVerification.belongsTo(models.User, { foreignKey: 'UserKey', as: 'User' });
  };

  return OtpVerification;
};