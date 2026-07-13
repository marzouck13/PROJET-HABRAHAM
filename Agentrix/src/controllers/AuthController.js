// controllers/AuthController.js
const axios = require('axios');
const bcrypt = require('bcrypt');
const { sequelize, User, Number: NumberModel } = require('../Models');
const prefixList = require('../config/prefix_list.json');

const API_BASE_URL = process.env.ONLINE_API_URL || 'https://agentrixservice.onrender.com';
// URL de l'API de vérification agent (à compléter avec votre lien définitif)
const AGENT_CHECK_API_URL = process.env.AGENT_CHECK_API_URL || 'https://agentrix.great-site.net/check_agent.php';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

/**
 * Détecte l'opérateur mobile à partir du préfixe du numéro.
 * @param {string} phoneNumber - Numéro de téléphone (8 à 10 chiffres)
 * @returns {string|null} Le nom de l'opérateur (MTN, MOOV, CELTIIS) ou null si non reconnu.
 */
function detectOperator(phoneNumber) {
  const cleaned = phoneNumber.replace(/\s/g, '');
  if (!/^\d{8,10}$/.test(cleaned)) return null;
  const prefix = cleaned.substring(0, 4);
  for (const op of prefixList) {
    if (op.prefixes.includes(prefix)) return op.operateur;
  }
  return null;
}

/**
 * Inscription initiale : crée l’utilisateur en local, appelle l’API distante.
 * En cas de succès, marque l’utilisateur comme synchronisé ; en cas d’échec,
 * annule l’enregistrement local.
 *
 * @param {import('express').Request} req - body : { nom, prenom, email }
 * @param {import('express').Response} res
 */
exports.register = async (req, res) => {
  const { nom, prenom, email } = req.body;
  const t = await sequelize.transaction();
  try {
    // 1. Création locale avec un UUID généré côté client
    const user = await User.create({
      Name: `${prenom} ${nom}`,
      Email: email,
      Password: '', // sera défini plus tard
      isEmailVerified: false,
      isPhoneVerified: false,
      isFullyVerified: false,
      isActive: true,
      isSent: false,
    }, { transaction: t });

    // 2. Appel API avec le même identifiant
    const response = await apiClient.post('/auth/register', {
      id: user.Id,
      nom,
      prenom,
      email,
    });

    // 3. Succès : marquer comme synchronisé
    await user.update({ isSent: true }, { transaction: t });
    await t.commit();
    return res.status(response.status).json(response.data);
  } catch (error) {
    await t.rollback();
    const status = error.response?.status || 500;
    const data = error.response?.data || { message: 'Échec de l’inscription' };
    return res.status(status).json(data);
  }
};

/**
 * Vérifie l'OTP reçu par email et met à jour le statut local.
 *
 * @param {import('express').Request} req - body : { email, otp }
 * @param {import('express').Response} res
 */
exports.verifyEmailOtp = async (req, res) => {
  const { email, otp } = req.body;
  try {
    // Vérification côté serveur
    const response = await apiClient.post('/auth/verify-email-otp', { email, otp });

    // Succès : mise à jour locale
    const user = await User.findOne({ where: { Email: email } });
    if (user) {
      await user.update({
        isEmailVerified: true,
        emailVerifiedAt: new Date(),
        isFullyVerified: user.isPhoneVerified, // complet si tel déjà vérifié
      });
    }

    return res.status(response.status).json(response.data);
  } catch (error) {
    const status = error.response?.status || 500;
    const data = error.response?.data || { message: 'Vérification OTP email échouée' };
    return res.status(status).json(data);
  }
};

/**
 * Définit le mot de passe de l’utilisateur après validation de l’email.
 * Stocke le hash localement.
 *
 * @param {import('express').Request} req - body : { email, password }
 * @param {import('express').Response} res
 */
exports.setPassword = async (req, res) => {
  const { email, password } = req.body;
  try {
    const response = await apiClient.post('/auth/set-password', { email, password });

    // Mise à jour locale du mot de passe hashé pour l'authentification hors ligne
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.findOne({ where: { Email: email } });
    if (user) {
      await user.update({ Password: hashedPassword });
    }

    return res.status(response.status).json(response.data);
  } catch (error) {
    const status = error.response?.status || 500;
    const data = error.response?.data || { message: 'Définition du mot de passe échouée' };
    return res.status(status).json(data);
  }
};

/**
 * Ajoute un numéro de téléphone pour l’utilisateur authentifié.
 * Vérifie d'abord que le numéro appartient à un agent via l'API check_agent.php.
 * Ensuite crée l’enregistrement local puis appelle l’API ; annule en cas d’échec.
 *
 * @param {import('express').Request} req - body : { phoneNumber, userId }
 * @param {import('express').Response} res
 */
exports.addNumber = async (req, res) => {
  const { phoneNumber, userId } = req.body;

  // Nettoyage du numéro
  const cleaned = phoneNumber.replace(/\s/g, '');
  if (!/^\d{8,10}$/.test(cleaned)) {
    return res.status(400).json({ message: 'Numéro de téléphone invalide' });
  }

  // 1. Vérification agent via l'API externe
  try {
    const checkResponse = await axios.get(AGENT_CHECK_API_URL, {
      params: { numero: cleaned },   // paramètre INTEGER attendu par l'API
      timeout: 10000,
    });

    const { success, data, message } = checkResponse.data;

    if (!success) {
      // Le numéro n'appartient pas à un agent
      return res.status(400).json({
        message: message || "Ce numéro n'est pas reconnu comme agent.",
      });
    }
    // Optionnel : vous pouvez stocker des informations de `data` si nécessaire
  } catch (error) {
    // Erreur réseau ou API indisponible
    console.error('Erreur lors de l’appel à l’API de vérification agent :', error.message);
    return res.status(502).json({
      message: 'Le service de vérification agent est indisponible.',
    });
  }

  // 2. Détection de l’opérateur
  const operator = detectOperator(phoneNumber);
  if (!operator) {
    return res.status(400).json({ message: 'Numéro de téléphone invalide ou opérateur non supporté' });
  }

  const t = await sequelize.transaction();
  try {
    // Création locale du numéro
    const number = await NumberModel.create({
      PhoneNumber: phoneNumber,
      Reseau: operator,
      isActive: true,
      isVerified: false,
      isSent: false,
      UserKey: userId,
    }, { transaction: t });

    // Appel API distante
    const response = await apiClient.post('/auth/add-number', {
      id: number.Id,
      phoneNumber,
      operator,
      userId,
    });

    // Succès : marquer comme synchronisé
    await number.update({ isSent: true }, { transaction: t });
    await t.commit();
    return res.status(response.status).json(response.data);
  } catch (error) {
    await t.rollback();
    const status = error.response?.status || 500;
    const data = error.response?.data || { message: 'Échec de l’ajout du numéro' };
    return res.status(status).json(data);
  }
};

/**
 * Vérifie l'OTP reçu par SMS et active le numéro localement.
 *
 * @param {import('express').Request} req - body : { phoneNumber, otp }
 * @param {import('express').Response} res
 */
exports.verifyPhoneOtp = async (req, res) => {
  const { phoneNumber, otp } = req.body;
  try {
    const response = await apiClient.post('/auth/verify-phone-otp', { phoneNumber, otp });

    // Mise à jour locale : numéro vérifié
    const number = await NumberModel.findOne({ where: { PhoneNumber: phoneNumber } });
    if (number) {
      await number.update({
        isVerified: true,
        verifiedAt: new Date(),
        isSent: true, // considéré comme synchronisé après vérification
      });

      // Mise à jour de l'utilisateur lié
      const user = await User.findByPk(number.UserKey);
      if (user) {
        await user.update({
          isPhoneVerified: true,
          phoneVerifiedAt: new Date(),
          isFullyVerified: user.isEmailVerified, // complet si email déjà vérifié
        });
      }
    }

    return res.status(response.status).json(response.data);
  } catch (error) {
    const status = error.response?.status || 500;
    const data = error.response?.data || { message: 'Vérification OTP téléphone échouée' };
    return res.status(status).json(data);
  }
};