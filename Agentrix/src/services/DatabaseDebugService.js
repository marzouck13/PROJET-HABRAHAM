// src/services/DatabaseDebugService.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Logger } from './LoggerService';
import db from './DatabaseService';

/**
 * Service de debug pour diagnostiquer les problèmes de base de données
 */
export class DatabaseDebugService {
  /**
   * Vérifie l'état complet de la base de données
   */
  static async diagnostiquer() {
    const rapport = {
      timestamp: new Date().toISOString(),
      database: {
        initialized: db.initialized,
        storage: {
          users: db.storage.users.length,
          numbers: db.storage.numbers.length,
          solds: db.storage.solds.length,
          transactions: db.storage.transactions.length,
          histories: db.storage.histories.length,
        }
      },
      asyncStorage: {},
      errors: []
    };

    Logger.info('DatabaseDebug', '🔍 DÉBUT DIAGNOSTIC COMPLET');

    try {
      // Vérifier AsyncStorage directement
      Logger.info('DatabaseDebug', '📱 Lecture directe d\'AsyncStorage...');
      
      const keys = await AsyncStorage.getAllKeys();
      rapport.asyncStorage.keys = keys;
      Logger.info('DatabaseDebug', `🔑 Clés trouvées: ${keys.length}`);
      
      for (const key of keys) {
        if (key.startsWith('@db_')) {
          const value = await AsyncStorage.getItem(key);
          const parsed = JSON.parse(value);
          rapport.asyncStorage[key] = {
            count: Array.isArray(parsed) ? parsed.length : 'N/A',
            data: parsed
          };
          Logger.info('DatabaseDebug', `📦 ${key}: ${Array.isArray(parsed) ? parsed.length : 'objet'} élément(s)`);
        }
      }

      // Vérifier la cohérence
      Logger.info('DatabaseDebug', '🔍 Vérification de cohérence...');
      
      const dbNumbers = db.storage.numbers.length;
      const asyncNumbers = rapport.asyncStorage['@db_numbers']?.count || 0;
      
      if (dbNumbers !== asyncNumbers) {
        rapport.errors.push(`INCOHÉRENCE: DB a ${dbNumbers} numéros, AsyncStorage a ${asyncNumbers}`);
        Logger.error('DatabaseDebug', `❌ ${rapport.errors[rapport.errors.length - 1]}`);
      } else {
        Logger.success('DatabaseDebug', `✅ Cohérence OK: ${dbNumbers} numéros`);
      }

      // Vérifier les soldes liés
      Logger.info('DatabaseDebug', '🔍 Vérification des soldes liés...');
      
      for (const number of db.storage.numbers) {
        const sold = db.storage.solds.find(s => s.NumberKey === number.Id);
        if (!sold) {
          rapport.errors.push(`Numéro ${number.PhoneNumber} n'a pas de solde associé`);
          Logger.warn('DatabaseDebug', `⚠️ ${rapport.errors[rapport.errors.length - 1]}`);
        } else {
          Logger.info('DatabaseDebug', `✅ ${number.PhoneNumber} → ${sold.CurrentBalance} FCFA`);
        }
      }

    } catch (error) {
      rapport.errors.push(`Erreur diagnostic: ${error.message}`);
      Logger.error('DatabaseDebug', `❌ ${error.message}`);
    }

    Logger.info('DatabaseDebug', '🏁 FIN DIAGNOSTIC');
    Logger.info('DatabaseDebug', `📊 Rapport complet: ${JSON.stringify(rapport, null, 2)}`);
    
    return rapport;
  }

  /**
   * Réinitialise complètement la base de données
   */
  static async reinitialiser() {
    Logger.warn('DatabaseDebug', '🗑️ RÉINITIALISATION COMPLÈTE DE LA BDD');
    
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      
      await AsyncStorage.removeItem('@db_users');
      await AsyncStorage.removeItem('@db_numbers');
      await AsyncStorage.removeItem('@db_solds');
      await AsyncStorage.removeItem('@db_transactions');
      await AsyncStorage.removeItem('@db_histories');
      
      db.storage = {
        users: [],
        numbers: [],
        solds: [],
        transactions: [],
        histories: [],
      };
      
      Logger.success('DatabaseDebug', '✅ Base de données réinitialisée');
      return { success: true };
    } catch (error) {
      Logger.error('DatabaseDebug', `❌ Erreur réinitialisation: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Force la sauvegarde des données
   */
  static async forcerSauvegarde() {
    Logger.info('DatabaseDebug', '💾 FORCAGE DE SAUVEGARDE');
    
    try {
      await db.save();
      Logger.success('DatabaseDebug', '✅ Sauvegarde forcée avec succès');
      return { success: true };
    } catch (error) {
      Logger.error('DatabaseDebug', `❌ Erreur sauvegarde: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Teste l'écriture et lecture d'AsyncStorage
   */
  static async testerAsyncStorage() {
    Logger.info('DatabaseDebug', '🧪 TEST AsyncStorage...');
    
    try {
      const testKey = '@db_test_' + Date.now();
      const testData = { test: 'value', timestamp: new Date().toISOString() };
      
      Logger.info('DatabaseDebug', `📝 Écriture de ${testKey}...`);
      await AsyncStorage.setItem(testKey, JSON.stringify(testData));
      
      Logger.info('DatabaseDebug', `📖 Lecture de ${testKey}...`);
      const retrieved = await AsyncStorage.getItem(testKey);
      const parsed = JSON.parse(retrieved);
      
      if (JSON.stringify(parsed) === JSON.stringify(testData)) {
        Logger.success('DatabaseDebug', '✅ Test AsyncStorage RÉUSSI');
        
        // Nettoyer
        await AsyncStorage.removeItem(testKey);
        
        return { success: true, message: 'AsyncStorage fonctionne correctement' };
      } else {
        Logger.error('DatabaseDebug', '❌ Données lues différentes des données écrites');
        return { success: false, message: 'Données corrompues' };
      }
    } catch (error) {
      Logger.error('DatabaseDebug', `❌ Erreur test: ${error.message}`);
      return { success: false, error: error.message };
    }
  }
}

export default DatabaseDebugService;