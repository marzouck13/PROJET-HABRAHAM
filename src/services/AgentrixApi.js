const express = require('express');
const router = express.Router();
const { AuthService } = require('../services/auth/AuthService');
const userRepository = require('../repository/UserRepository');
const { QueryTypes } = require('sequelize'); // Requis pour l'extraction brute du visualiseur

const authService = new AuthService(userRepository);

/**
 * 0. ROUTE DE TEST & VISUALISEUR BDD
 */

/**
 * Route de test de l'API
 * @route GET /test
 * @returns {Object} 200 - Succès de l'API
 */
router.get("/test", (req, res) => {
  return res.json({ success: true, message: "API OK", data: null });
});

// Nouvelle route publique pour ton visualiseur
// Nouvelle route publique pour ton visualiseur

/**
 * Visualiseur de base de données - Exporte tout le contenu des tables
 * @route GET /database
 * @returns {Object} 200 - Export JSON complet de la BDD
 * @returns {Object} 500 - Erreur d'extraction
 */
router.get("/database", async (req, res) => {
  try {
    // Récupération de l'instance sequelize via getDb()
    const database = await userRepository.getDb();
    const sequelize = database.sequelize; // L'instance sequelize est sur l'objet database
    const currentDbName = sequelize.config.database;

    const exportData = {
      exportedAt: new Date().toISOString(),
      database: currentDbName,
      tables: {}
    };

    // 1. Récupérer toutes les tables de la base de données
    const tables = await sequelize.query(
      `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = :dbName`,
      {
        replacements: { dbName: currentDbName },
        type: QueryTypes.SELECT
      }
    );

    // 2. Extraire dynamiquement le contenu de chaque table
    for (const row of tables) {
      const tableName = row.TABLE_NAME;
      try {
        const rows = await sequelize.query(
          `SELECT * FROM \`${tableName}\` LIMIT 1000`,
          { type: QueryTypes.SELECT }
        );
        exportData.tables[tableName] = rows;
      } catch (tableError) {
        console.error(`Erreur table ${tableName}:`, tableError.message);
        exportData.tables[tableName] = [];
      }
    }

    // 3. Envoyer le JSON
    return res.json(exportData);

  } catch (error) {
    console.error("[ERROR] Visualizer failed:", error);
    return res.status(500).json({ 
      success: false, 
      error: "Erreur d'extraction de la base de données",
      message: error.message 
    });
  }
});

/**
 * 1. WORKFLOW D'INSCRIPTION & VALIDATION (OTP)
 */

/**
 * Inscription d'un nouvel utilisateur
 * @route POST /register
 * @param {string} name - Nom de l'utilisateur
 * @param {string} firstname - Prénom de l'utilisateur
 * @param {string} email - Email de l'utilisateur
 * @param {string} NPI - Numéro NPI
 * @param {string} number - Numéro de téléphone
 * @param {string} password - Mot de passe
 * @returns {Object} Résultat de l'inscription
 */
router.post('/register', async (req, res) => {
  const { name, firstname, email, NPI, number, password } = req.body;
  const result = await authService.Register(name, firstname, email, NPI, number, password);
  return res.json(result);
});

/**
 * Vérification du code OTP
 * @route POST /verify
 * @param {string} number - Numéro de téléphone
 * @param {string} code - Code de vérification
 * @returns {Object} Résultat de la vérification
 */
router.post('/verify', async (req, res) => {
  const { number, code } = req.body;
  const result = await authService.CodeVerify(number, code);
  return res.json(result);
});

/**
 * Renvoi d'un nouveau code de vérification
 * @route POST /resend-code
 * @param {string} number - Numéro de téléphone
 * @returns {Object} Résultat du renvoi
 */
router.post('/resend-code', async (req, res) => {
  const { number } = req.body;
  const result = await authService.ResendVerificationCode(number);
  return res.json(result);
});

/**
 * 2. CONNEXION
 */

/**
 * Connexion utilisateur
 * @route POST /login
 * @param {string} number - Numéro de téléphone
 * @param {string} password - Mot de passe
 * @returns {Object} Tokens d'authentification
 */
router.post('/login', async (req, res) => {
  const { number, password } = req.body;
  const result = await authService.Login(number, password);
  return res.json(result);
});

/**
 * 3. GESTION DES SESSIONS & TOKENS (REFRESH & VALIDATE)
 */

/**
 * Vérification et rafraîchissement du token
 * @route POST /token/verify
 * @param {string} refreshToken - Token de rafraîchissement
 * @returns {Object} Nouveau token d'accès
 */
router.post('/token/verify', async (req, res) => {
  const { refreshToken } = req.body;
  const result = await authService.TokenVerify(refreshToken);
  return res.json(result);
});

/**
 * Validation d'un token d'accès
 * @route POST /token/validate
 * @param {string} accessToken - Token d'accès à valider
 * @returns {Object} Statut de validité du token
 */
router.post('/token/validate', async (req, res) => {
  const { accessToken } = req.body;
  const result = await authService.ValidateAccessToken(accessToken);
  return res.json(result);
});

/**
 * 4. RÉINITIALISATION DE MOT DE PASSE (OUBLIÉ)
 */

/**
 * Demande de réinitialisation de mot de passe
 * @route POST /forgot-password
 * @param {string} number - Numéro de téléphone
 * @returns {Object} Envoi du code de réinitialisation
 */
router.post('/forgot-password', async (req, res) => {
  const { number } = req.body;
  const result = await authService.ForgotPassword(number);
  return res.json(result);
});

/**
 * Réinitialisation du mot de passe avec code
 * @route POST /reset-password
 * @param {string} number - Numéro de téléphone
 * @param {string} code - Code de réinitialisation
 * @param {string} newPassword - Nouveau mot de passe
 * @returns {Object} Résultat de la réinitialisation
 */
router.post('/reset-password', async (req, res) => {
  const { number, code, newPassword } = req.body;
  const result = await authService.ResetPassword(number, code, newPassword);
  return res.json(result);
});

/**
 * 5. SÉCURITÉ COMPTE & PARAMÈTRES (SESSION ACTIVE)
 */

/**
 * Changement de mot de passe utilisateur connecté
 * @route PUT /change-password
 * @param {number} userId - ID de l'utilisateur
 * @param {string} currentPassword - Mot de passe actuel
 * @param {string} newPassword - Nouveau mot de passe
 * @returns {Object} Résultat du changement
 */
router.put('/change-password', async (req, res) => {
  const { userId, currentPassword, newPassword } = req.body;
  const result = await authService.ChangePassword(userId, currentPassword, newPassword);
  return res.json(result);
});

/**
 * 6. DÉCONNEXION
 */

/**
 * Déconnexion utilisateur
 * @route POST /logout
 * @param {string} refreshToken - Token de rafraîchissement à invalider
 * @returns {Object} Confirmation de déconnexion
 */
router.post('/logout', async (req, res) => {
  const { refreshToken } = req.body;
  const result = await authService.Logout(refreshToken);
  return res.json(result);
});

module.exports = router;