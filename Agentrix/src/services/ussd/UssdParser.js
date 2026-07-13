  // src/services/ussd/UssdParser.js
  import { Logger } from '../LoggerService';

  /**
   * Patterns AMÉLIORÉS de détection de solde
   * Supporte maintenant : F, FCFA, XOF, francs, etc.
   */
  const SOLDE_PATTERNS_STRICTS = [
    // Pattern 1 : "solde" suivi de n'importe quoi puis nombre + unité (F, FCFA, etc.)
    /(?:solde|balance|account|compte)[^0-9]*?([0-9][0-9\s.,]*)\s*(?:fcfa|xof|francs?|f)\b/i,
    
    // Pattern 2 : "solde ... est/de ... nombre" (sans unité obligatoire)
    /(?:solde|balance|account|compte)[^0-9]*?(?:est|de|:|=)\s*([0-9][0-9\s.,]*)/i,
    
    // Pattern 3 : nombre suivi de F, FCFA, XOF, etc. (n'importe où dans le texte)
    /([0-9][0-9\s.,]*)\s*(?:fcfa|xof|francs?|f)\b/i,
  ];

  /**
   * Pattern de SECOURS (faible confiance)
   */
  const SOLDE_PATTERN_GENERIQUE = /\b([0-9]{4,})\b/;

  /**
   * Patterns de détection d'erreur
   */
  const ERROR_PATTERNS = [
    { pattern: /pin\s*(?:incorrect|invalid|erroné|wrong)/i, status: 'WRONG_PIN' },
    { pattern: /code\s*(?:incorrect|invalid|erroné|wrong)/i, status: 'WRONG_PIN' },
    { pattern: /timeout|délai\s*(?:expiré|dépassé)|session\s*expir/i, status: 'TIMEOUT' },
    { pattern: /(?:transaction|opération|requête|service)\s*(?:a\s*)?(?:échoué|failed|en\s*erreur)/i, status: 'ERROR' },
    { pattern: /annulé(?:e)?\s*(?:par\s*(?:l['']utilisateur|vous))?|cancelled|aborted/i, status: 'CANCELLED' },
  ];

  /**
   * Nettoie une chaîne de caractères pour extraire un nombre
   */
  function nettoyerNombre(texte) {
    if (!texte) return null;

    let nettoye = texte.replace(/\s/g, '');

    const aVirgule = nettoye.includes(',');
    const aPoint = nettoye.includes('.');

    if (aVirgule && aPoint) {
      if (nettoye.lastIndexOf(',') > nettoye.lastIndexOf('.')) {
        nettoye = nettoye.replace(/\./g, '').replace(',', '.');
      } else {
        nettoye = nettoye.replace(/,/g, '');
      }
    } else if (aVirgule) {
      const parties = nettoye.split(',');
      if (parties.length === 2 && parties[1].length <= 2) {
        nettoye = nettoye.replace(',', '.');
      } else {
        nettoye = nettoye.replace(/,/g, '');
      }
    } else if (aPoint) {
      const parties = nettoye.split('.');
      if (parties.length === 2 && parties[1].length <= 2) {
        // Garder tel quel
      } else {
        nettoye = nettoye.replace(/\./g, '');
      }
    }

    const nombreMatch = nettoye.match(/[0-9]+(?:\.[0-9]+)?/);
    if (!nombreMatch) return null;

    const nombre = parseFloat(nombreMatch[0]);
    return isNaN(nombre) ? null : nombre;
  }

  /**
   * Essaie d'extraire un solde à partir d'une liste de patterns
   */
  function extraireSoldeAvecPatterns(texteBrut, patterns) {
    for (let i = 0; i < patterns.length; i++) {
      const match = texteBrut.match(patterns[i]);
      if (match && match[1]) {
        const soldeNettoye = nettoyerNombre(match[1]);
        if (soldeNettoye !== null && soldeNettoye > 0) {
          return soldeNettoye;
        }
      }
    }
    return null;
  }

  /**
   * Analyse une réponse USSD brute et extrait le solde
   */
  export function analyzeUssdResponse(texteBrut, operateur = null) {
    Logger.info('UssdParser', `🔍 Analyse du message (${texteBrut?.length || 0} caractères)`);
    Logger.debug('UssdParser', `Message brut: "${texteBrut}"`);

    if (!texteBrut || texteBrut.trim().length === 0) {
      Logger.warn('UssdParser', 'Message vide');
      return { status: 'EMPTY', data: null, message: 'Message vide' };
    }

    // 1. Tenter l'extraction avec les patterns STRICTS
    const soldeStrict = extraireSoldeAvecPatterns(texteBrut, SOLDE_PATTERNS_STRICTS);
    if (soldeStrict !== null) {
      Logger.success('UssdParser', `✅ Solde extrait (pattern strict): ${soldeStrict} FCFA`);
      return { status: 'SUCCESS', data: soldeStrict, message: texteBrut };
    }

    // 2. Vérifier les erreurs
    for (let i = 0; i < ERROR_PATTERNS.length; i++) {
      const { pattern, status } = ERROR_PATTERNS[i];
      if (pattern.test(texteBrut)) {
        Logger.warn('UssdParser', `❌ Erreur détectée: ${status}`);
        return { status, data: null, message: texteBrut };
      }
    }

    // 3. Pattern générique à faible confiance
    const matchGenerique = texteBrut.match(SOLDE_PATTERN_GENERIQUE);
    if (matchGenerique && matchGenerique[1]) {
      const soldeIncertain = nettoyerNombre(matchGenerique[1]);
      if (soldeIncertain !== null && soldeIncertain > 0) {
        Logger.warn('UssdParser', `⚠️ Solde incertain extrait (pattern générique): ${soldeIncertain} FCFA`);
        return {
          status: 'SUCCESS_INCERTAIN',
          data: soldeIncertain,
          message: texteBrut
        };
      }
    }

    // 4. Aucun pattern n'a matché
    Logger.warn('UssdParser', '❌ Aucun solde trouvé dans le message');
    return {
      status: 'NO_BALANCE_FOUND',
      data: null,
      message: texteBrut
    };
  }

  /**
   * Test rapide pour vérifier si un message contient un solde
   */
  export function contientSolde(texte) {
    if (!texte) return false;

    const motifs = [
      /solde/i,
      /balance/i,
      /compte/i,
      /fcfa/i,
      /\bf\b/i,
      /[0-9]{4,}/,
    ];

    for (let i = 0; i < motifs.length; i++) {
      if (motifs[i].test(texte)) return true;
    }

    return false;
  }

  export default {
    analyze: analyzeUssdResponse,
    contientSolde: contientSolde,
    nettoyerNombre: nettoyerNombre,
  };