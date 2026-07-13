// Models/History.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const History = sequelize.define('History', {
    Id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    DateKey: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    DayString: {
      type: DataTypes.STRING,
      allowNull: false
    },
    Year: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    Month: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    TotalDepots: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0.00
    },
    TotalRetraits: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0.00
    },
    TotalCommissions: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0.00
    },
    isSent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    timestamps: true,
    indexes: [
      { fields: ['DateKey'] },
      { fields: ['DayString'] },
      { fields: ['UserKey', 'DateKey'] },
      { fields: ['Year', 'Month'] },
      { fields: ['isSent'] }
    ]
  });

  History.associate = (models) => {
    History.belongsTo(models.User, { foreignKey: 'UserKey', as: 'User' });
    History.belongsTo(models.Transacs, { foreignKey: 'TransacsKey', as: 'Transaction' });
    History.belongsTo(models.Number, { foreignKey: 'NumberKey', as: 'Number' });
  };

  return History;
};