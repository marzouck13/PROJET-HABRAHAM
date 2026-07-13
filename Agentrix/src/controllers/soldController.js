// controllers/soldController.js
const { Sold, Number } = require('../Models');

// Récupérer le solde d'un numéro
const getSoldByNumber = async (req, res) => {
  try {
    const sold = await Sold.findOne({
      where: { NumberKey: req.params.numberId },
      include: [{ model: Number, as: 'Number' }]
    });
    if (!sold) return res.status(404).json({ error: 'Solde introuvable.' });
    res.json(sold);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Mettre à jour le solde (après une transaction)
const updateBalance = async (req, res) => {
  try {
    const { numberId } = req.params;
    const { newBalance } = req.body;

    const sold = await Sold.findOne({ where: { NumberKey: numberId } });
    if (!sold) return res.status(404).json({ error: 'Solde introuvable.' });

    await sold.update({
      CurrentBalance: newBalance,
      LastTransactionDate: new Date()
    });

    res.json(sold);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Ajouter/soustraire un montant au solde
const adjustBalance = async (req, res) => {
  try {
    const { numberId } = req.params;
    const { amount, type } = req.body; // type: 'DEPOT' ou 'RETRAIT'

    const sold = await Sold.findOne({ where: { NumberKey: numberId } });
    if (!sold) return res.status(404).json({ error: 'Solde introuvable.' });

    let newBalance;
    if (type === 'DEPOT' || type === 'COMMISSION') {
      newBalance = parseFloat(sold.CurrentBalance) + parseFloat(amount);
    } else if (type === 'RETRAIT') {
      newBalance = parseFloat(sold.CurrentBalance) - parseFloat(amount);
      if (newBalance < 0) {
        return res.status(400).json({ error: 'Solde insuffisant.' });
      }
    } else {
      newBalance = parseFloat(amount); // AJUSTEMENT
    }

    await sold.update({
      CurrentBalance: newBalance,
      LastTransactionDate: new Date()
    });

    res.json(sold);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getSoldByNumber,
  updateBalance,
  adjustBalance
};