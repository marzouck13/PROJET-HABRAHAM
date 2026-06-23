// agentrix/src/services/ussd/UssdService.js

import { NativeModules, NativeEventEmitter, Platform } from 'react-native';
import { getUssdCode } from './UssdLibrary';
import UssdParser from './UssdParser';

const { MomoAutomationModule } = NativeModules;

/**
 * Service d'envoi de codes USSD et d'interception des réponses.
 */
class UssdService {
  constructor() {
    this.eventEmitter = Platform.OS === 'android' ? new NativeEventEmitter(MomoAutomationModule) : null;
    this.isInitialized = false;
    this.activeListeners = new Set();
  }

  /**
   * Initialise le pont natif et le listener de notifications.
   * À appeler une fois au démarrage.
   */
  async initialize() {
    if (this.isInitialized) return true;
    if (Platform.OS !== 'android') {
      throw new Error('USSD disponible uniquement sur Android');
    }
    if (!MomoAutomationModule) {
      throw new Error('Module natif MomoAutomationModule non trouvé');
    }

    try {
      await MomoAutomationModule.initializeNotificationListener();
      this.isInitialized = true;
      console.log('✅ UssdService initialisé');
      return true;
    } catch (error) {
      console.error('❌ Échec initialisation UssdService:', error);
      throw error;
    }
  }

  /**
   * Envoie un code USSD brut (sans passer par la bibliothèque)
   * @param {string} code - Le code complet (ex: '*100#')
   */
  async sendRaw(code) {
    this._ensureInitialized();
    try {
      const result = await MomoAutomationModule.sendUssd(code);
      console.log(`📤 USSD envoyé: ${code}`);
      return result;
    } catch (error) {
      throw new Error(`Erreur d'envoi USSD: ${error.message}`);
    }
  }

  /**
   * Envoie un code USSD depuis la bibliothèque
   * @param {string} operator - Opérateur
   * @param {string} action - Action
   * @param {Object} vars - Variables dynamiques
   */
  async send(operator, action, vars = {}) {
    const code = getUssdCode(operator, action, vars);
    return this.sendRaw(code);
  }

  /**
   * Écoute les réponses (notifications/SMS) et exécute un callback.
   * Retourne un objet avec `promise` et `remove()`.
   * @param {Object} options
   * @param {number} options.timeout - ms avant rejet (défaut 30000)
   * @param {RegExp|string} options.filterPattern - Filtre sur le contenu
   * @param {string} options.operator - Filtre par opérateur (mtn, orange, etc.)
   * @param {Function} callback - Appelé à chaque notification correspondante
   */
  listenForResponse(callback, options = {}) {
    this._ensureInitialized();

    const {
      timeout = 30000,
      filterPattern = null,
      operator = null
    } = options;

    let timeoutId;
    let subscription;

    const cleanup = () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (subscription) {
        subscription.remove();
        this.activeListeners.delete(subscription);
      }
    };

    const responsePromise = new Promise((resolve, reject) => {
      subscription = this.eventEmitter.addListener('onSmsReceived', (data) => {
        try {
          const notification = typeof data === 'string' ? JSON.parse(data) : data;
          const text = notification.text || notification.title || '';

          // Filtre par motif
          if (filterPattern) {
            const pattern = filterPattern instanceof RegExp ? filterPattern : new RegExp(filterPattern, 'i');
            if (!pattern.test(text)) return;
          }

          // Filtre par opérateur (mots-clés)
          if (operator) {
            const opPatterns = {
              mtn: /mtn|mobile money/i,
              orange: /orange money/i,
              moov: /moov/i,
              wave: /wave/i
            };
            const opRegex = opPatterns[operator];
            if (opRegex && !opRegex.test(text)) return;
          }

          // Appel du callback
          if (callback) {
            callback(notification);
          }

          cleanup();
          resolve(notification);
        } catch (err) {
          console.error('Erreur traitement réponse:', err);
        }
      });

      this.activeListeners.add(subscription);

      // Timeout
      timeoutId = setTimeout(() => {
        cleanup();
        reject(new Error('Timeout - aucune réponse USSD reçue'));
      }, timeout);
    });

    return {
      promise: responsePromise,
      remove: cleanup
    };
  }

  /**
   * Envoie un code USSD et attend une réponse unique.
   * @param {string} code - Code USSD à envoyer
   * @param {Object} options - Options d'écoute (timeout, filterPattern, operator)
   * @returns {Promise<Object>} La notification reçue
   */
  async sendAndWait(code, options = {}) {
    // Créer le listener avant l'envoi pour ne rien manquer
    const listener = this.listenForResponse(null, options);
    await this.sendRaw(code);
    return listener.promise;
  }

  /**
   * Envoie un code depuis la bibliothèque et attend la réponse.
   * @param {string} operator
   * @param {string} action
   * @param {Object} vars
   * @param {Object} options
   */
  async sendFromLibraryAndWait(operator, action, vars = {}, options = {}) {
    const code = getUssdCode(operator, action, vars);
    return this.sendAndWait(code, options);
  }

  /**
   * Méthode de haut niveau : demande de solde
   * @param {string} operator - 'mtn', 'orange', 'wave'
   * @returns {Promise<{balance: number, currency: string}>}
   */
  async checkBalance(operator = 'mtn') {
    const response = await this.sendFromLibraryAndWait(operator, 'balance', {}, {
      timeout: 15000,
      operator
    });
    const parsed = UssdParser.parseBalance(response, operator);
    return parsed;
  }

  /**
   * Méthode de haut niveau : transfert d'argent.
   * Seul le numéro du bénéficiaire et le montant sont obligatoires,
   * le code PIN peut être demandé interactivement ou stocké.
   * @param {string} recipient - Numéro du bénéficiaire
   * @param {number} amount - Montant
   * @param {string} pin - Code secret
   * @param {string} operator - 'mtn', 'orange', 'wave'
   */
  async transferMoney(recipient, amount, pin, operator = 'mtn') {
    const response = await this.sendFromLibraryAndWait(operator, 'sendMoney', {
      recipient,
      amount,
      pin
    }, {
      timeout: 45000,
      operator,
      filterPattern: /réussi|succès|effectué|transféré|confirmation/i
    });

    return UssdParser.parseTransactionConfirmation(response, operator);
  }

  /**
   * Nettoie tous les listeners actifs
   */
  destroy() {
    this.activeListeners.forEach(sub => sub.remove());
    this.activeListeners.clear();
    this.isInitialized = false;
  }

  _ensureInitialized() {
    if (!this.isInitialized) {
      throw new Error('UssdService non initialisé. Appelez initialize() d\'abord.');
    }
  }
}

// Singleton
const ussdService = new UssdService();
export default ussdService;