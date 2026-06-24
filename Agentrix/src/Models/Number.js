// models/Number.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Number = sequelize.define('Number', {
    Id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    PhoneNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        is: /^[0-9]{8,10}$/
      }
    },
    Reseau: {
      type: DataTypes.ENUM('MTN', 'MOOV', 'CELTIIS'),
      allowNull: false
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    // Vérification spécifique au numéro
    isVerified: {
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
      { fields: ['PhoneNumber'] },
      { fields: ['Reseau'] },
      { fields: ['UserKey'] },
      { fields: ['isVerified'] },
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