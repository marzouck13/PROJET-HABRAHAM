// controllers/userController.js
const { sequelize, User, Number, Transacs, History } = require('../Models');

const createUser = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { Name, Email, Password } = req.body;

    const existing = await User.findOne({ where: { Email }, transaction: t });
    if (existing) {
      await t.rollback();
      return res.status(400).json({ error: 'Cet email est déjà utilisé.' });
    }

    const user = await User.create({ Name, Email, Password, isSent: false }, { transaction: t });
    await t.commit();
    res.status(201).json(user);
  } catch (error) {
    await t.rollback();
    res.status(500).json({ error: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      include: [
        { model: Number, as: 'Numbers' },
        { model: Transacs, as: 'Transactions' },
        { model: History, as: 'Histories' }
      ]
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      include: [
        { model: Number, as: 'Numbers', include: [{ model: require('../Models').Sold, as: 'Sold' }] },
        { model: Transacs, as: 'Transactions' },
        { model: History, as: 'Histories' }
      ]
    });
    if (!user) return res.status(404).json({ error: 'Utilisateur introuvable.' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateUser = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const user = await User.findByPk(req.params.id, { transaction: t });
    if (!user) {
      await t.rollback();
      return res.status(404).json({ error: 'Utilisateur introuvable.' });
    }

    await user.update(req.body, { transaction: t });
    await t.commit();
    res.json(user);
  } catch (error) {
    await t.rollback();
    res.status(500).json({ error: error.message });
  }
};

const deleteUser = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const user = await User.findByPk(req.params.id, { transaction: t });
    if (!user) {
      await t.rollback();
      return res.status(404).json({ error: 'Utilisateur introuvable.' });
    }

    await user.destroy({ transaction: t });
    await t.commit();
    res.json({ message: 'Utilisateur supprimé.' });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ error: error.message });
  }
};

const verifyEmail = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const user = await User.findByPk(req.params.id, { transaction: t });
    if (!user) {
      await t.rollback();
      return res.status(404).json({ error: 'Utilisateur introuvable.' });
    }

    await user.update({
      isEmailVerified: true,
      emailVerifiedAt: new Date(),
      isFullyVerified: user.isPhoneVerified
    }, { transaction: t });

    await t.commit();
    res.json(user);
  } catch (error) {
    await t.rollback();
    res.status(500).json({ error: error.message });
  }
};

const verifyPhone = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const user = await User.findByPk(req.params.id, { transaction: t });
    if (!user) {
      await t.rollback();
      return res.status(404).json({ error: 'Utilisateur introuvable.' });
    }

    await user.update({
      isPhoneVerified: true,
      phoneVerifiedAt: new Date(),
      isFullyVerified: user.isEmailVerified
    }, { transaction: t });

    await t.commit();
    res.json(user);
  } catch (error) {
    await t.rollback();
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  verifyEmail,
  verifyPhone
};