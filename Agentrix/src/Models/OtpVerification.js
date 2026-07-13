// Models/OtpVerification.js
module.exports = (sequelize, DataTypes) => {
  const OtpVerification = sequelize.define('OtpVerification', {
    Id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    EmailOtp: DataTypes.STRING(6),
    EmailOtpExpiresAt: DataTypes.DATE,
    isEmailOtpUsed: { type: DataTypes.BOOLEAN, defaultValue: false },
    EmailOtpAttempts: { type: DataTypes.INTEGER, defaultValue: 0 },
    PhoneOtp: DataTypes.STRING(6),
    PhoneOtpExpiresAt: DataTypes.DATE,
    isPhoneOtpUsed: { type: DataTypes.BOOLEAN, defaultValue: false },
    PhoneOtpAttempts: { type: DataTypes.INTEGER, defaultValue: 0 },
    isBothVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
    verifiedAt: DataTypes.DATE
  }, {
    timestamps: true,
    indexes: [{ fields: ['UserKey'] }]
  });

  OtpVerification.associate = (models) => {
    OtpVerification.belongsTo(models.User, { foreignKey: 'UserKey', as: 'User' });
  };

  return OtpVerification;
};