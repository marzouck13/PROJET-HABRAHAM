// src/services/operatorDetection.js
import prefixList from '../config/prefix_list.json'; // ou le chemin correct

/**
 * Détecte l'opérateur mobile à partir du préfixe du numéro.
 * @param {string} phoneNumber - Numéro de téléphone (8 à 10 chiffres)
 * @returns {string|null} L'opérateur (MTN, MOOV, CELTIIS) ou null si non reconnu.
 */
export function detectOperator(phoneNumber) {
  const cleaned = phoneNumber.replace(/\s/g, '');
  if (!/^\d{8,10}$/.test(cleaned)) return null;
  const prefix = cleaned.substring(0, 4);
  for (const op of prefixList) {
    if (op.prefixes.includes(prefix)) return op.operateur;
  }
  return null;
}