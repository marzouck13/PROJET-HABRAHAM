const { Number: NumberModel, Sold, Transacs } = require('../Models');

/**
 * Contrôleur interne gérant les transactions (dépôt, retrait, commission, ajustement).
 * Les dates et heures sont automatiquement gérées par Sequelize (timestamps).
 * L'instance ne prend aucun paramètre au constructeur.
 */
class TransacController {
  constructor() {}

  /**
   * Récupère un numéro actif et son solde associé.
   * @param {string} numberId - UUID du numéro (Number)
   * @returns {{ number: object, sold: object }}
   * @throws {Error} Si le numéro est introuvable, inactif ou sans solde.
   */
  async _getNumberAndSold(numberId) {
    const number = await NumberModel.findByPk(numberId, {
      include: { model: Sold, as: 'Sold' },
    });
    if (!number || !number.isActive) {
      throw new Error('Numéro introuvable ou inactif');
    }
    if (!number.Sold) {
      throw new Error('Aucun solde associé à ce numéro');
    }
    return { number, sold: number.Sold };
  }

  /**
   * Crée une transaction et l'enregistre dans la base.
   * @param {string} userKey - UUID de l'utilisateur
   * @param {string} numberKey - UUID du numéro
   * @param {'DEPOT'|'RETRAIT'|'COMMISSION'|'AJUSTEMENT'} type - Type de transaction
   * @param {number} amount - Montant positif
   * @param {number} balanceBefore - Solde avant opération
   * @param {number} balanceAfter - Solde après opération
   * @param {string} reseau - Réseau mobile (MTN, MOOV, CELTIIS)
   * @returns {Promise<object>} L'enregistrement Transacs créé
   */
  async _createTransaction(userKey, numberKey, type, amount, balanceBefore, balanceAfter, reseau) {
    return Transacs.create({
      UserKey: userKey,
      NumberKey: numberKey,
      Type: type,
      Amount: amount,
      BalanceBefore: balanceBefore,
      BalanceAfter: balanceAfter,
      Reseau: reseau,
    });
  }

  /**
   * Effectue un dépôt sur un numéro.
   * @param {string} numberId - UUID du numéro
   * @param {number} amount - Montant à ajouter
   * @returns {Promise<object>} La transaction créée
   */
  async depot(numberId, amount) {
    const { number, sold } = await this._getNumberAndSold(numberId);
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      throw new Error('Le montant doit être un nombre positif');
    }
    const oldBalance = parseFloat(sold.CurrentBalance);
    const newBalance = oldBalance + numericAmount;

    const transaction = await this._createTransaction(
      number.UserKey,
      numberId,
      'DEPOT',
      numericAmount,
      oldBalance,
      newBalance,
      number.Reseau
    );

    await sold.update({
      CurrentBalance: newBalance,
      LastTransactionDate: new Date(),
    });

    return transaction;
  }

  /**
   * Effectue un retrait sur un numéro.
   * @param {string} numberId - UUID du numéro
   * @param {number} amount - Montant à retirer
   * @returns {Promise<object>} La transaction créée
   * @throws {Error} Si le solde est insuffisant
   */
  async retrait(numberId, amount) {
    const { number, sold } = await this._getNumberAndSold(numberId);
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      throw new Error('Le montant doit être un nombre positif');
    }
    const oldBalance = parseFloat(sold.CurrentBalance);
    if (oldBalance < numericAmount) {
      throw new Error('Solde insuffisant');
    }
    const newBalance = oldBalance - numericAmount;

    const transaction = await this._createTransaction(
      number.UserKey,
      numberId,
      'RETRAIT',
      numericAmount,
      oldBalance,
      newBalance,
      number.Reseau
    );

    await sold.update({
      CurrentBalance: newBalance,
      LastTransactionDate: new Date(),
    });

    return transaction;
  }

  /**
   * Effectue un prélèvement de commission.
   * @param {string} numberId - UUID du numéro
   * @param {number} amount - Montant de la commission
   * @returns {Promise<object>} La transaction créée
   * @throws {Error} Si le solde est insuffisant
   */
  async commission(numberId, amount) {
    const { number, sold } = await this._getNumberAndSold(numberId);
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      throw new Error('Le montant doit être un nombre positif');
    }
    const oldBalance = parseFloat(sold.CurrentBalance);
    if (oldBalance < numericAmount) {
      throw new Error('Solde insuffisant pour la commission');
    }
    const newBalance = oldBalance - numericAmount;

    const transaction = await this._createTransaction(
      number.UserKey,
      numberId,
      'COMMISSION',
      numericAmount,
      oldBalance,
      newBalance,
      number.Reseau
    );

    await sold.update({
      CurrentBalance: newBalance,
      LastTransactionDate: new Date(),
    });

    return transaction;
  }

  /**
   * Effectue un ajustement (positif ou négatif) du solde.
   * @param {string} numberId - UUID du numéro
   * @param {number} amount - Valeur de l'ajustement (peut être négative)
   * @returns {Promise<object>} La transaction créée
   */
  async ajustement(numberId, amount) {
    const { number, sold } = await this._getNumberAndSold(numberId);
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount)) {
      throw new Error('Le montant doit être un nombre valide');
    }
    const oldBalance = parseFloat(sold.CurrentBalance);
    const newBalance = oldBalance + numericAmount;

    const transaction = await this._createTransaction(
      number.UserKey,
      numberId,
      'AJUSTEMENT',
      Math.abs(numericAmount),
      oldBalance,
      newBalance,
      number.Reseau
    );

    await sold.update({
      CurrentBalance: newBalance,
      LastTransactionDate: new Date(),
    });

    return transaction;
  }
}

module.exports = new TransacController();