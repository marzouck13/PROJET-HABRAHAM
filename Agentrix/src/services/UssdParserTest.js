// src/services/UssdParserTest.js
import { analyzeUssdResponse } from './ussd/UssdParser';
import { Logger } from './LoggerService';

/**
 * Teste le parsing avec différents messages
 */
export function testerParsing() {
  const messages = [
    "Message Celltiis Le solde de vote compte principal est de 2240,12F . OK",
    "Votre solde est de 15000 FCFA",
    "Solde disponible: 25000F",
    "Balance: 30000 XOF",
    "Message erreur: PIN incorrect",
  ];

  Logger.info('ParserTest', '🧪 DÉBUT TESTS DE PARSING');
  
  messages.forEach((msg, i) => {
    Logger.info('ParserTest', `\n📝 Test ${i + 1}: "${msg}"`);
    const result = analyzeUssdResponse(msg);
    Logger.info('ParserTest', `📊 Résultat: Status=${result.status}, Data=${result.data}`);
  });
  
  Logger.info('ParserTest', '🏁 FIN TESTS DE PARSING');
}