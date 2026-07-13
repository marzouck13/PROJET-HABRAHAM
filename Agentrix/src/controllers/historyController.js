// controllers/historyController.js
const { sequelize, History, User, Number } = require('../Models');
const { Op } = require('sequelize');

const getHistoryByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { year, month, startDate, endDate } = req.query;

    const where = { UserKey: userId };

    if (year) where.Year = parseInt(year);
    if (month) where.Month = parseInt(month);
    if (startDate || endDate) {
      where.DateKey = {};
      if (startDate) where.DateKey[Op.gte] = startDate;
      if (endDate) where.DateKey[Op.lte] = endDate;
    }

    const histories = await History.findAll({
      where,
      include: [
        { model: User, as: 'User' },
        { model: Number, as: 'Number' }
      ],
      order: [['DateKey', 'DESC']]
    });

    res.json(histories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getHistoryByDate = async (req, res) => {
  try {
    const { userId, date } = req.params;
    const history = await History.findOne({
      where: { UserKey: userId, DateKey: date },
      include: [
        { model: User, as: 'User' },
        { model: Number, as: 'Number' }
      ]
    });
    if (!history) return res.status(404).json({ error: 'Historique introuvable pour cette date.' });
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const upsertDailyHistory = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { userId } = req.params;
    const { DateKey, DayString, Year, Month, TotalDepots, TotalRetraits, TotalCommissions } = req.body;

    let history = await History.findOne({
      where: { UserKey: userId, DateKey },
      transaction: t
    });

    if (history) {
      await history.update({
        TotalDepots: TotalDepots || history.TotalDepots,
        TotalRetraits: TotalRetraits || history.TotalRetraits,
        TotalCommissions: TotalCommissions || history.TotalCommissions
      }, { transaction: t });
    } else {
      history = await History.create({
        UserKey: userId,
        DateKey,
        DayString,
        Year,
        Month,
        TotalDepots: TotalDepots || 0,
        TotalRetraits: TotalRetraits || 0,
        TotalCommissions: TotalCommissions || 0,
        isSent: false
      }, { transaction: t });
    }

    await t.commit();
    res.json(history);
  } catch (error) {
    await t.rollback();
    res.status(500).json({ error: error.message });
  }
};

const getMonthlyStats = async (req, res) => {
  try {
    const { userId } = req.params;
    const { year, month } = req.query;

    const where = { UserKey: userId };
    if (year) where.Year = parseInt(year);
    if (month) where.Month = parseInt(month);

    const histories = await History.findAll({ where });

    const stats = {
      totalDepots: 0,
      totalRetraits: 0,
      totalCommissions: 0,
      daysCount: histories.length
    };

    histories.forEach(h => {
      stats.totalDepots += parseFloat(h.TotalDepots);
      stats.totalRetraits += parseFloat(h.TotalRetraits);
      stats.totalCommissions += parseFloat(h.TotalCommissions);
    });

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteHistory = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const history = await History.findByPk(req.params.id, { transaction: t });
    if (!history) {
      await t.rollback();
      return res.status(404).json({ error: 'Historique introuvable.' });
    }

    await history.destroy({ transaction: t });
    await t.commit();
    res.json({ message: 'Historique supprimé.' });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getHistoryByUser,
  getHistoryByDate,
  upsertDailyHistory,
  getMonthlyStats,
  deleteHistory
};