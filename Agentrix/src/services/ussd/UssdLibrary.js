// src/services/ussd/UssdLibrary.js

export const RESEAUX = {
  MTN: 'MTN',
  MOOV: 'MOOV',
  CELTIIS: 'CELTIIS',
};

/**
 * Génère le code USSD pour un transfert d'agent à agent.
 * Format actuel : *889*4*1*numero*montant*motif*2#
 *
 * @param {string} reseau - L'opérateur (MTN, MOOV, CELTIIS)
 * @param {string} numeroDestinataire - Numéro du bénéficiaire
 * @param {number|string} montant - Montant à transférer
 * @param {string} motif - Raison du transfert (max ~10 caractères)
 * @returns {string} Le code USSD à exécuter
 */
export function genererCodeTransfert(reseau, numeroDestinataire, montant, motif) {
  const num = String(numeroDestinataire).replace(/\D/g, '');
  const mtt = String(montant).replace(/\D/g, '');
  const mtf = String(motif || '').trim().substring(0, 10);

  switch (reseau) {
    case RESEAUX.MTN:
      return `*165*1*${num}*${mtt}*${mtf}*2#`;
    case RESEAUX.MOOV:
      return `*155*1*${num}*${mtt}*${mtf}*2#`;
    case RESEAUX.CELTIIS:
      return `*889*4*1*${num}*${mtt}*${mtf}*2#`;
    default:
      throw new Error(`Réseau inconnu : ${reseau}`);
  }
}

/**
 * Récupère la liste des réseaux disponibles pour les numéros enregistrés d'un utilisateur.
 *
 * @param {Array} numerosEnregistres - Liste des numéros (objets avec propriété "Reseau")
 * @returns {Array} Liste des réseaux uniques (ex: ['MTN', 'CELTIIS'])
 */
export function obtenirReseauxDisponibles(numerosEnregistres) {
  if (!numerosEnregistres || !Array.isArray(numerosEnregistres)) return [];
  const reseaux = numerosEnregistres
    .map(n => n.Reseau)
    .filter(Boolean);
  return [...new Set(reseaux)];
}

// ══════════════════════════════════════════════════════════════
// Fonctions placeholder (ne pas toucher pour le moment)
// ══════════════════════════════════════════════════════════════

export function genererCodeDepot() {
  throw new Error('Non implémenté');
}

export function genererCodeRetrait() {
  throw new Error('Non implémenté');
}

export function genererCodeSolde() {
  throw new Error('Non implémenté');
}

export function genererCodeAchatCredit() {
  throw new Error('Non implémenté');
}