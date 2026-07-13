// src/services/ussd/UssdCodes.js
export const SOLDE_CODES = {
  MTN: '*880*4#',
  MOOV: '*855*4#',      // À confirmer, mais cohérent avec la demande
  CELTIIS: '*889*1*1#',
};

export function getSoldeCode(reseau) {
  return SOLDE_CODES[reseau] || null;
}