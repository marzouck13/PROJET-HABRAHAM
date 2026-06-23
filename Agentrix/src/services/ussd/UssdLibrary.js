// agentrix/src/services/ussd/UssdLibrary.js

/**
 * Bibliothèque de codes USSD dynamiques.
 * Chaque opérateur possède des actions avec :
 * - template : chaîne contenant des variables ${...}
 * - description : texte explicatif
 * - requiredVars : liste des variables obligatoires
 * - optionalVars : liste des variables facultatives
 */
const UssdLibrary = {
  // ======================== MTN Mobile Money ========================
  mtn: {
    balance: {
      template: '*880*4#',
      description: 'Consulter le solde du compte MTN Mobile Money',
      requiredVars: [],
      optionalVars: []
    },
    sendMoney: {
      template: '*880*1*1*${recipient}*${amount}*${pin}#',
      description: 'Transférer de l\'argent vers un autre compte MTN',
      requiredVars: ['recipient', 'amount', 'pin'],
      optionalVars: ['message']
    },
    buyCredit: {
      template: '*100*2*${amount}#',
      description: 'Acheter du crédit téléphonique pour soi-même',
      requiredVars: ['amount'],
      optionalVars: ['phoneNumber'] // si pour un autre numéro
    },
    buyCreditForOther: {
      template: '*100*2*${phoneNumber}*${amount}#',
      description: 'Acheter du crédit pour un autre numéro',
      requiredVars: ['phoneNumber', 'amount'],
      optionalVars: []
    },
    payBill: {
      template: '*100*3*${merchantCode}*${amount}*${pin}#',
      description: 'Payer une facture (eau, électricité, etc.)',
      requiredVars: ['merchantCode', 'amount', 'pin'],
      optionalVars: ['reference']
    },
    checkTransaction: {
      template: '*100*4#',
      description: 'Vérifier les dernières transactions',
      requiredVars: [],
      optionalVars: []
    },
    changePin: {
      template: '*100*5*${oldPin}*${newPin}*${newPin}#',
      description: 'Changer le code secret',
      requiredVars: ['oldPin', 'newPin'],
      optionalVars: []
    },
    withdrawCash: {
      template: '*100*6*${amount}*${pin}#',
      description: 'Retirer de l\'argent chez un marchand',
      requiredVars: ['amount', 'pin'],
      optionalVars: ['agentCode']
    },
  },

  // ======================== Orange Money ========================
  orange: {
    balance: {
      template: '*144#',
      description: 'Consulter le solde Orange Money',
      requiredVars: [],
      optionalVars: []
    },
    sendMoney: {
      template: '*144*1*${recipient}*${amount}*${pin}#',
      description: 'Transfert d\'argent Orange Money',
      requiredVars: ['recipient', 'amount', 'pin'],
      optionalVars: []
    },
    buyCredit: {
      template: '*144*2*${amount}#',
      description: 'Acheter du crédit Orange',
      requiredVars: ['amount'],
      optionalVars: ['phoneNumber']
    },
    payBill: {
      template: '*144*3*${merchantCode}*${amount}*${pin}#',
      description: 'Payer une facture',
      requiredVars: ['merchantCode', 'amount', 'pin'],
      optionalVars: []
    },
    checkTransaction: {
      template: '*144*4#',
      description: 'Historique des transactions',
      requiredVars: [],
      optionalVars: []
    },
    changePin: {
      template: '*144*5*${oldPin}*${newPin}*${newPin}#',
      description: 'Modifier le code secret',
      requiredVars: ['oldPin', 'newPin'],
      optionalVars: []
    },
  },

  // ======================== Wave ========================
  wave: {
    balance: {
      template: '*201#',
      description: 'Solde Wave',
      requiredVars: [],
      optionalVars: []
    },
    sendMoney: {
      template: '*201*1*${recipient}*${amount}*${pin}#',
      description: 'Envoyer de l\'argent via Wave',
      requiredVars: ['recipient', 'amount', 'pin'],
      optionalVars: []
    },
    buyCredit: {
      template: '*201*2*${amount}#',
      description: 'Acheter du crédit',
      requiredVars: ['amount'],
      optionalVars: []
    },
    withdrawCash: {
      template: '*201*3*${amount}*${pin}#',
      description: 'Retrait d\'espèces',
      requiredVars: ['amount', 'pin'],
      optionalVars: []
    },
  },

  // ======================== Codes génériques / personnalisés ========================
  generic: {
    callBack: {
      template: '*${serviceCode}*${phoneNumber}#',
      description: 'Demander un rappel',
      requiredVars: ['serviceCode', 'phoneNumber'],
      optionalVars: []
    },
    checkService: {
      template: '*${serviceCode}#',
      description: 'Vérifier un service',
      requiredVars: ['serviceCode'],
      optionalVars: []
    },
    custom: {
      template: '${code}',
      description: 'Code USSD entièrement personnalisé',
      requiredVars: ['code'],
      optionalVars: []
    }
  }
};

// ==================== Fonctions utilitaires de la bibliothèque ====================

/**
 * Vérifie que toutes les variables requises sont fournies
 * @param {string} operator - Nom de l'opérateur
 * @param {string} action - Nom de l'action
 * @param {Object} vars - Variables fournies
 * @returns {string[]} Liste des variables manquantes
 */
function validateVariables(operator, action, vars = {}) {
  const actionDef = UssdLibrary[operator]?.[action];
  if (!actionDef) throw new Error(`Action ${operator}.${action} inconnue`);

  const missing = actionDef.requiredVars.filter(v => !(v in vars) || vars[v] === undefined || vars[v] === '');
  return missing;
}

/**
 * Remplace les variables dans le template
 * @param {string} template - Template USSD
 * @param {Object} vars - Variables à injecter
 * @returns {string} Code USSD final
 */
function interpolate(template, vars = {}) {
  return template.replace(/\$\{(\w+)\}/g, (match, key) => {
    if (key in vars) return vars[key];
    console.warn(`⚠️ Variable "${key}" non fournie, laissée telle quelle`);
    return match;
  });
}

/**
 * Récupère le code USSD final pour une action donnée
 * @param {string} operator - Opérateur
 * @param {string} action - Action
 * @param {Object} vars - Variables dynamiques
 * @returns {string} Code USSD prêt à être envoyé
 */
function getUssdCode(operator, action, vars = {}) {
  const actionDef = UssdLibrary[operator]?.[action];
  if (!actionDef) throw new Error(`Action "${operator}.${action}" non trouvée`);

  const missing = validateVariables(operator, action, vars);
  if (missing.length > 0) {
    throw new Error(`Variables manquantes pour ${operator}.${action} : ${missing.join(', ')}`);
  }

  return interpolate(actionDef.template, vars);
}

/**
 * Ajoute ou modifie une action dans la bibliothèque
 * @param {string} operator - Opérateur
 * @param {string} action - Nom de l'action
 * @param {string} template - Template USSD
 * @param {string} description - Description
 * @param {string[]} requiredVars - Variables obligatoires
 * @param {string[]} optionalVars - Variables facultatives
 */
function addAction(operator, action, template, description = '', requiredVars = [], optionalVars = []) {
  if (!UssdLibrary[operator]) {
    UssdLibrary[operator] = {};
  }
  UssdLibrary[operator][action] = {
    template,
    description,
    requiredVars,
    optionalVars
  };
}

/**
 * Récupère la liste des opérateurs disponibles
 */
function getOperators() {
  return Object.keys(UssdLibrary);
}

/**
 * Récupère les actions disponibles pour un opérateur
 */
function getActions(operator) {
  return Object.keys(UssdLibrary[operator] || {});
}

/**
 * Exporte toute la bibliothèque (pour sauvegarde)
 */
function exportLibrary() {
  return JSON.parse(JSON.stringify(UssdLibrary));
}

/**
 * Importe une bibliothèque externe (fusionne)
 */
function importLibrary(lib) {
  Object.entries(lib).forEach(([op, actions]) => {
    if (!UssdLibrary[op]) UssdLibrary[op] = {};
    Object.assign(UssdLibrary[op], actions);
  });
}

export {
  UssdLibrary as default,
  getUssdCode,
  validateVariables,
  interpolate,
  addAction,
  getOperators,
  getActions,
  exportLibrary,
  importLibrary
};