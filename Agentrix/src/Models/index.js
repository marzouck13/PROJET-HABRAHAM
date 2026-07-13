// Models/index.js
const { Sequelize } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '..', 'AgentrixDB.db'),
  logging: false,
  define: {
    freezeTableName: true,
    timestamps: true
  }
});

const UserModel = require('./User');
const NumberModel = require('./Number');
const SoldModel = require('./Sold');
const TransacsModel = require('./Transacs');
const HistoryModel = require('./History');

const User = UserModel(sequelize, Sequelize.DataTypes);
const Number = NumberModel(sequelize, Sequelize.DataTypes);
const Sold = SoldModel(sequelize, Sequelize.DataTypes);
const Transacs = TransacsModel(sequelize, Sequelize.DataTypes);
const History = HistoryModel(sequelize, Sequelize.DataTypes);

const models = { User, Number, Sold, Transacs, History };

Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

module.exports = { sequelize, Sequelize, ...models };