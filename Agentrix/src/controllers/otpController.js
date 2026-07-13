// controllers/otpController.js
const { sequelize, OtpVerification, User } = require('../Models');

const createOtp = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { UserKey, EmailOtp, PhoneOtp, EmailOtpExpiresAt, PhoneOtpExpiresAt } = req.body;

    const user = await User.findByPk(UserKey, { transaction: t });
    if (!user) {
      await t.rollback();
      return res.status(404).json({ error: 'Utilisateur introuvable.' });
    }

    await OtpVerification.destroy({ where: { UserKey }, transaction: t });

    const otp = await OtpVerification.create({
      UserKey,
      EmailOtp,
      PhoneOtp,
      EmailOtpExpiresAt,
      PhoneOtpExpiresAt
    }, { transaction: t });

    await t.commit();
    res.status(201).json(otp);
  } catch (error) {
    await t.rollback();
    res.status(500).json({ error: error.message });
  }
};

const verifyEmailOtp = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { UserKey, otp } = req.body;

    const otpRecord = await OtpVerification.findOne({
      where: { UserKey },
      order: [['createdAt', 'DESC']],
      transaction: t
    });

    if (!otpRecord) {
      await t.rollback();
      return res.status(404).json({ error: 'Aucun OTP trouvé.' });
    }

    if (otpRecord.isEmailOtpUsed) {
      await t.rollback();
      return res.status(400).json({ error: 'OTP déjà utilisé.' });
    }

    if (new Date() > new Date(otpRecord.EmailOtpExpiresAt)) {
      await t.rollback();
      return res.status(400).json({ error: 'OTP expiré.' });
    }

    if (otpRecord.EmailOtpAttempts >= 3) {
      await t.rollback();
      return res.status(400).json({ error: 'Trop de tentatives.' });
    }

    if (otpRecord.EmailOtp !== otp) {
      await otpRecord.update({
        EmailOtpAttempts: otpRecord.EmailOtpAttempts + 1
      }, { transaction: t });
      await t.commit();
      return res.status(400).json({ error: 'OTP incorrect.' });
    }

    await otpRecord.update({ isEmailOtpUsed: true }, { transaction: t });

    const user = await User.findByPk(UserKey, { transaction: t });
    await user.update({
      isEmailVerified: true,
      emailVerifiedAt: new Date(),
      isFullyVerified: user.isPhoneVerified
    }, { transaction: t });

    if (otpRecord.isPhoneOtpUsed) {
      await otpRecord.update({ isBothVerified: true, verifiedAt: new Date() }, { transaction: t });
    }

    await t.commit();
    res.json({ message: 'Email vérifié avec succès.' });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ error: error.message });
  }
};

const verifyPhoneOtp = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { UserKey, otp } = req.body;

    const otpRecord = await OtpVerification.findOne({
      where: { UserKey },
      order: [['createdAt', 'DESC']],
      transaction: t
    });

    if (!otpRecord) {
      await t.rollback();
      return res.status(404).json({ error: 'Aucun OTP trouvé.' });
    }

    if (otpRecord.isPhoneOtpUsed) {
      await t.rollback();
      return res.status(400).json({ error: 'OTP déjà utilisé.' });
    }

    if (new Date() > new Date(otpRecord.PhoneOtpExpiresAt)) {
      await t.rollback();
      return res.status(400).json({ error: 'OTP expiré.' });
    }

    if (otpRecord.PhoneOtpAttempts >= 3) {
      await t.rollback();
      return res.status(400).json({ error: 'Trop de tentatives.' });
    }

    if (otpRecord.PhoneOtp !== otp) {
      await otpRecord.update({
        PhoneOtpAttempts: otpRecord.PhoneOtpAttempts + 1
      }, { transaction: t });
      await t.commit();
      return res.status(400).json({ error: 'OTP incorrect.' });
    }

    await otpRecord.update({ isPhoneOtpUsed: true }, { transaction: t });

    const user = await User.findByPk(UserKey, { transaction: t });
    await user.update({
      isPhoneVerified: true,
      phoneVerifiedAt: new Date(),
      isFullyVerified: user.isEmailVerified
    }, { transaction: t });

    if (otpRecord.isEmailOtpUsed) {
      await otpRecord.update({ isBothVerified: true, verifiedAt: new Date() }, { transaction: t });
    }

    await t.commit();
    res.json({ message: 'Téléphone vérifié avec succès.' });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ error: error.message });
  }
};

const getOtpStatus = async (req, res) => {
  try {
    const otp = await OtpVerification.findOne({
      where: { UserKey: req.params.userId },
      order: [['createdAt', 'DESC']]
    });

    if (!otp) return res.status(404).json({ error: 'Aucun OTP trouvé.' });

    res.json({
      isEmailOtpUsed: otp.isEmailOtpUsed,
      isPhoneOtpUsed: otp.isPhoneOtpUsed,
      isBothVerified: otp.isBothVerified,
      emailAttempts: otp.EmailOtpAttempts,
      phoneAttempts: otp.PhoneOtpAttempts
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createOtp,
  verifyEmailOtp,
  verifyPhoneOtp,
  getOtpStatus
};