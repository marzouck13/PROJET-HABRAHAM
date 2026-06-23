// agentrix/src/services/ussd/UssdParser.js

/**
 * Parse les réponses USSD/SMS pour extraire des informations standardisées.
 */
class UssdParser {
  /**
   * Extrait le solde d'un message
   * @param {Object} notification - { title, text, subText, fullMessage }
   * @param {string} operator
   * @returns {{ balance: number, currency: string, raw: string }}
   */
  parseBalance(notification, operator = 'mtn') {
    const text = notification.fullMessage || notification.text || '';
    const patterns = {
      mtn: /solde.*?(\d[\d\s,]*)\s*(FCFA|XOF|€)/i,
      orange: /votre solde.*?(\d[\d\s,]*)\s*(FCFA|XOF|€)/i,
      wave: /balance.*?(\d[\d\s,]*)\s*(FCFA|XOF|€)/i
    };

    const pattern = patterns[operator] || patterns.mtn;
    const match = text.match(pattern);
    if (!match) return null;

    const balance = parseFloat(match[1].replace(/[\s,]/g, ''));
    const currency = match[2] || 'XOF';

    return { balance, currency, raw: text };
  }

  /**
   * Extrait la confirmation d'une transaction
   * @returns {{ success: boolean, amount: number, fee: number, reference: string, message: string }}
   */
  parseTransactionConfirmation(notification, operator = 'mtn') {
    const text = notification.fullMessage || notification.text || '';
    const success = /réussi|succès|effectué|transféré|confirmé/i.test(text);

    const amountMatch = text.match(/montant.*?(\d[\d\s,]*)/i) || text.match(/(\d[\d\s,]*)\s*(FCFA|XOF|€)/);
    const amount = amountMatch ? parseFloat(amountMatch[1].replace(/[\s,]/g, '')) : null;

    const refMatch = text.match(/ref[:\s]*(\w+)/i) || text.match(/id[:\s]*(\w+)/i);
    const reference = refMatch ? refMatch[1] : null;

    const feeMatch = text.match(/frais.*?(\d[\d\s,]*)/i);
    const fee = feeMatch ? parseFloat(feeMatch[1].replace(/[\s,]/g, '')) : 0;

    return {
      success,
      amount,
      fee,
      reference,
      message: text
    };
  }

  /**
   * Extrait les options d'un menu USSD (ex: "1. Acheter crédit\n2. Solde")
   * @returns {Array<{key: string, label: string}>}
   */
  parseMenu(notification) {
    const text = notification.fullMessage || notification.text || '';
    const lines = text.split('\n');
    const options = [];
    const menuRegex = /^\s*(\d+)[.)\s-]+(.+)/;

    for (const line of lines) {
      const match = line.match(menuRegex);
      if (match) {
        options.push({ key: match[1], label: match[2].trim() });
      }
    }
    return options;
  }
}

export default new UssdParser();