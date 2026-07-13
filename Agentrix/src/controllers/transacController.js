// controllers/transacsController.js
const { sequelize, Transacs, User, Number, Sold, History } = require('../Models');
const { Op } = require('sequelize');

const createTransaction = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { Type, Amount, Reseau, UserKey, NumberKey } = req.body;

    const user = await User.findByPk(UserKey, { transaction: t });
    if (!user) {
      await t.rollback();
      return res.status(404).json({ error: 'Utilisateur introuvable.' });
    }

    const number = await Number.findByPk(NumberKey, { transaction: t });
    if (!number) {
      await t.rollback();
      return res.status(404).json({ error: 'Numéro introuvable.' });
    }

    const sold = await Sold.findOne({ where: { NumberKey }, transaction: t });
    if (!sold) {
      await t.rollback();
      return res.status(404).json({ error: 'Solde introuvable.' });
    }

    const balanceBefore = parseFloat(sold.CurrentBalance);
    const amount = parseFloat(Amount);
    let balanceAfter;

    switch (Type) {
      case 'DEPOT':
      case 'COMMISSION':
        balanceAfter = balanceBefore + amount;
        break;
      case 'RETRAIT':
        balanceAfter = balanceBefore - amount;
        if (balanceAfter < 0) {
          await t.rollback();
          return res.status(400).json({ error: 'Solde insuffisant.' });
        }
        break;
      case 'AJUSTEMENT':
        balanceAfter = amount;
        break;
      default:
        await t.rollback();
        return res.status(400).json({ error: 'Type de transaction invalide.' });
    }

    const transaction = await Transacs.create({
      Type,
      Amount: amount,
      BalanceBefore: balanceBefore,
      BalanceAfter: balanceAfter,
      Reseau,
      UserKey,
      NumberKey,
      isSent: false
    }, { transaction: t });

    await sold.update({
      CurrentBalance: balanceAfter,
      LastTransactionDate: new Date()
    }, { transaction: t });

    await updateDailyHistory(UserKey, NumberKey, Type, amount, t);

    await t.commit();
    res.status(201).json(transaction);
  } catch (error) {
    await t.rollback();
    res.status(500).json({ error: error.message });
  }
};

const updateDailyHistory = async (UserKey, NumberKey, type, amount, transaction) => {
  const today = new Date().toISOString().split('T')[0];
  const now = new Date();

  let history = await History.findOne({
    where: { UserKey, DateKey: today },
    transaction
  });

  if (!history) {
    history = await History.create({
      UserKey,
      NumberKey,
      DateKey: today,
      DayString: now.toLocaleDateString('fr-FR', { weekday: 'long' }),
      Year: now.getFullYear(),
      Month: now.getMonth() + 1,
      TotalDepots: 0,
      TotalRetraits: 0,
      TotalCommissions: 0,
      isSent: false
    }, { transaction });
  }

  const updateData = {};
  switch (type) {
    case 'DEPOT':
      updateData.TotalDepots = parseFloat(history.TotalDepots) + amount;
      break;
    case 'RETRAIT':
      updateData.TotalRetraits = parseFloat(history.TotalRetraits) + amount;
      break;
    case 'COMMISSION':
      updateData.TotalCommissions = parseFloat(history.TotalCommissions) + amount;
      break;
  }

  if (Object.keys(updateData).length > 0) {
    await history.update(updateData, { transaction });
  }
};

const getTransactionsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50, offset = 0, type, startDate, endDate } = req.query;

    const where = { UserKey: userId };
    if (type) where.Type = type;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt[Op.gte] = new Date(startDate);
      if (endDate) where.createdAt[Op.lte] = new Date(endDate);
    }

    const transactions = await Transacs.findAll({
      where,
      include: [
        { model: Number, as: 'Number' },
        { model: User, as: 'User' }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getTransactionsByNumber = async (req, res) => {
  try {
    const { numberId } = req.params;
    const transactions = await Transacs.findAll({
      where: { NumberKey: numberId },
      include: [{ model: Number, as: 'Number' }],
      order: [['createdAt', 'DESC']]
    });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getUserStats = async (req, res) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;

    const where = { UserKey: userId };
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt[Op.gte] = new Date(startDate);
      if (endDate) where.createdAt[Op.lte] = new Date(endDate);
    }

    const transactions = await Transacs.findAll({ where });

    const stats = {
      totalDepots: 0,
      totalRetraits: 0,
      totalCommissions: 0,
      totalTransactions: transactions.length,
      byNetwork: { MTN: 0, MOOV: 0, CELTIIS: 0 }
    };

    transactions.forEach(t => {
      const amount = parseFloat(t.Amount);
      switch (t.Type) {
        case 'DEPOT': stats.totalDepots += amount; break;
        case 'RETRAIT': stats.totalRetraits += amount; break;
        case 'COMMISSION': stats.totalCommissions += amount; break;
      }
      if (stats.byNetwork[t.Reseau] !== undefined) {
        stats.byNetwork[t.Reseau] += amount;
      }
    });

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getTransactionById = async (req, res) => {
  try {
    const transaction = await Transacs.findByPk(req.params.id, {
      include: [
        { model: User, as: 'User' },
        { model: Number, as: 'Number' }
      ]
    });
    if (!transaction) return res.status(404).json({ error: 'Transaction introuvable.' });
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createTransaction,
  getTransactionsByUser,
  getTransactionsByNumber,
  getUserStats,
  getTransactionById
};