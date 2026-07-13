// controllers/numberController.js
const { sequelize, Number, Sold, User, Transacs } = require('../Models');

const addNumber = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { PhoneNumber, Reseau, UserKey, soldeInitial = 0 } = req.body;

    const existing = await Number.findOne({ where: { PhoneNumber }, transaction: t });
    if (existing) {
      await t.rollback();
      return res.status(400).json({ error: 'Ce numéro est déjà enregistré.' });
    }

    const user = await User.findByPk(UserKey, { transaction: t });
    if (!user) {
      await t.rollback();
      return res.status(404).json({ error: 'Utilisateur introuvable.' });
    }

    const number = await Number.create({
      PhoneNumber,
      Reseau,
      UserKey,
      isActive: true,
      isVerified: true,
      verifiedAt: new Date(),
      isSent: false
    }, { transaction: t });

    const sold = await Sold.create({
      NumberKey: number.Id,
      CurrentBalance: soldeInitial,
      LastTransactionDate: new Date(),
      isSent: false
    }, { transaction: t });

    await t.commit();
    res.status(201).json({ number, sold });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ error: error.message });
  }
};

const getNumbersByUser = async (req, res) => {
  try {
    const numbers = await Number.findAll({
      where: { UserKey: req.params.userId },
      include: [
        { model: Sold, as: 'Sold' },
        { model: Transacs, as: 'Transactions' }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(numbers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getNumberById = async (req, res) => {
  try {
    const number = await Number.findByPk(req.params.id, {
      include: [
        { model: Sold, as: 'Sold' },
        { model: Transacs, as: 'Transactions' },
        { model: User, as: 'User' }
      ]
    });
    if (!number) return res.status(404).json({ error: 'Numéro introuvable.' });
    res.json(number);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateNumber = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const number = await Number.findByPk(req.params.id, { transaction: t });
    if (!number) {
      await t.rollback();
      return res.status(404).json({ error: 'Numéro introuvable.' });
    }

    await number.update(req.body, { transaction: t });
    await t.commit();
    res.json(number);
  } catch (error) {
    await t.rollback();
    res.status(500).json({ error: error.message });
  }
};

const deleteNumber = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const number = await Number.findByPk(req.params.id, { transaction: t });
    if (!number) {
      await t.rollback();
      return res.status(404).json({ error: 'Numéro introuvable.' });
    }

    await Sold.destroy({ where: { NumberKey: number.Id }, transaction: t });
    await number.destroy({ transaction: t });
    await t.commit();
    res.json({ message: 'Numéro supprimé.' });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ error: error.message });
  }
};

const verifyNumber = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const number = await Number.findByPk(req.params.id, { transaction: t });
    if (!number) {
      await t.rollback();
      return res.status(404).json({ error: 'Numéro introuvable.' });
    }

    await number.update({
      isVerified: true,
      verifiedAt: new Date()
    }, { transaction: t });

    await t.commit();
    res.json(number);
  } catch (error) {
    await t.rollback();
    res.status(500).json({ error: error.message });
  }
};

const toggleActive = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const number = await Number.findByPk(req.params.id, { transaction: t });
    if (!number) {
      await t.rollback();
      return res.status(404).json({ error: 'Numéro introuvable.' });
    }

    await number.update({ isActive: !number.isActive }, { transaction: t });
    await t.commit();
    res.json(number);
  } catch (error) {
    await t.rollback();
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  addNumber,
  getNumbersByUser,
  getNumberById,
  updateNumber,
  deleteNumber,
  verifyNumber,
  toggleActive
};