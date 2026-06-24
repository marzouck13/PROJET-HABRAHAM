// controllers/SyncController.js
const axios = require('axios');
const { User, OtpVerification, Number, Sold, Transacs, History } = require('../Models');

const SYNC_API_URL = process.env.ONLINE_API_URL || 'https://agentrixservice.onrender.com';
const BATCH_SIZE = 50;

const apiClient = axios.create({
  baseURL: SYNC_API_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

/**
 * Ordre de synchronisation respectant les dépendances (clés étrangères).
 * User → OtpVerification → Number → Sold → Transacs → History
 */
const SYNC_ORDER = [
  { model: User, endpoint: '/sync/user', foreignKey: null },
  { model: OtpVerification, endpoint: '/sync/otp', foreignKey: 'UserKey' },
  { model: Number, endpoint: '/sync/number', foreignKey: 'UserKey' },
  { model: Sold, endpoint: '/sync/sold', foreignKey: 'NumberKey' },
  { model: Transacs, endpoint: '/sync/transacs', foreignKey: 'UserKey' },
  { model: History, endpoint: '/sync/history', foreignKey: 'UserKey' },
];

/**
 * Contrôleur de synchronisation automatique.
 * Envoie tous les enregistrements locaux avec isSent=false vers l'API distante.
 */
class SyncController {
  /**
   * Lance la synchronisation complète de toutes les tables dans l'ordre.
   * @returns {Promise<{success: boolean, details: object}>}
   */
  async syncAll() {
    const results = {};
    let globalSuccess = true;

    for (const entry of SYNC_ORDER) {
      try {
        const res = await this._syncModel(entry.model, entry.endpoint);
        results[entry.model.name] = res;
        if (!res.success) globalSuccess = false;
      } catch (error) {
        results[entry.model.name] = { success: false, message: error.message };
        globalSuccess = false;
      }
    }

    return { success: globalSuccess, details: results };
  }

  /**
   * Synchronise un seul modèle par lots.
   * @param {object} model - Modèle Sequelize
   * @param {string} endpoint - Chemin de l'API pour ce type de données
   * @returns {Promise<{success: boolean, syncedCount: number, message?: string}>}
   */
  async _syncModel(model, endpoint) {
    let offset = 0;
    let syncedCount = 0;

    try {
      while (true) {
        const records = await model.findAll({
          where: { isSent: false },
          limit: BATCH_SIZE,
          offset: offset,
          raw: true,
        });

        if (records.length === 0) break;

        const payload = records.map(record => this._formatRecord(record));
        const response = await apiClient.post(endpoint, { data: payload });

        if (response.status !== 200 && response.status !== 201) {
          throw new Error(`Échec de l'envoi (${response.status})`);
        }

        const ids = records.map(r => r.Id);
        await model.update(
          { isSent: true },
          { where: { Id: ids } }
        );

        syncedCount += records.length;
        offset += BATCH_SIZE;
      }

      return { success: true, syncedCount };
    } catch (error) {
      return {
        success: false,
        syncedCount,
        message: error.message,
      };
    }
  }

  /**
   * Nettoie un enregistrement avant envoi (supprime les champs locaux inutiles).
   * @param {object} record - Enregistrement brut
   * @returns {object} Copie nettoyée
   */
  _formatRecord(record) {
    const { isSent, createdAt, updatedAt, ...clean } = record;
    return clean;
  }
}

module.exports = new SyncController();