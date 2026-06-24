// models/index.js
const { Sequelize } = require('sequelize');
const path = require('path');

// Configuration de la base de données SQLite (locale)
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '..', 'database.sqlite'),
  logging: false, // Mettre true pour debugger les requêtes SQL
  define: {
    freezeTableName: true, // Empêche Sequelize de pluraliser les noms de tables
    timestamps: true // Active createdAt et updatedAt par défaut
  }
});

// Import des modèles
const UserModel = require('./User');
const OtpVerificationModel = require('./OtpVerification');
const NumberModel = require('./Number');
const SoldModel = require('./Sold');
const TransacsModel = require('./Transacs');
const HistoryModel = require('./History');

// Initialisation des modèles
const User = UserModel(sequelize);
const OtpVerification = OtpVerificationModel(sequelize);
const Number = NumberModel(sequelize);
const Sold = SoldModel(sequelize);
const Transacs = TransacsModel(sequelize);
const History = HistoryModel(sequelize);

// Objet contenant tous les modèles
const models = {
  User,
  OtpVerification,
  Number,
  Sold,
  Transacs,
  History
};

// Application des associations
Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

// Fonction de synchronisation de la base de données
const syncDatabase = async (force = false) => {
  try {
    await sequelize.sync({ force }); // force: true supprime et recrée les tables
    console.log('✅ Base de données synchronisée avec succès');
    
    if (force) {
      console.log('⚠️  ATTENTION: Toutes les tables ont été recréées (force: true)');
    }
  } catch (error) {
    console.error('❌ Erreur lors de la synchronisation:', error);
    throw error;
  }
};

// Export du sequelize instance, des modèles et de la fonction sync
module.exports = {
  sequelize,
  Sequelize,
  ...models,
  syncDatabase
};