// src/services/NumberService.js
import db from './DatabaseService';
import { Logger } from './LoggerService';

/**
 * Service de gestion des numéros et des soldes
 */
export class NumberService {
    /**
   * Enregistre un nouveau numéro avec son solde initial
   * OU met à jour le numéro et le solde s'il existe déjà
   */
    static async enregistrerNumero(phoneNumber, reseau, soldeInitial, userId = null) {
    Logger.info('NumberService', '🚀 DÉBUT enregistrerNumero()');
    
    try {
      const existant = await db.getNumberByPhone(phoneNumber);
      
      if (existant) {
        Logger.info('NumberService', `⚠️ Numéro déjà enregistré: ${existant.Id}. Mise à jour des données...`);
        
        // 1. Mettre à jour ou créer le solde
        const sold = await db.getSoldByNumberId(existant.Id);
        if (sold) {
          await db.updateSold(sold.Id, {
            CurrentBalance: soldeInitial,
            LastTransactionDate: new Date().toISOString(),
          });
        } else {
          await db.createSold({
            NumberKey: existant.Id,
            CurrentBalance: soldeInitial,
            LastTransactionDate: new Date().toISOString(),
          });
        }
        
        // 2. Mettre à jour les infos du numéro
        await db.updateNumber(existant.Id, {
          Reseau: reseau,
          UserKey: userId || existant.UserKey,
          isVerified: true,
          verifiedAt: new Date().toISOString(),
        });

        Logger.success('NumberService', `✅ Numéro et solde mis à jour avec succès`);
        return { success: true, number: existant, message: 'Numéro mis à jour avec succès' };
      }

      // Création si inexistant
      Logger.info('NumberService', '📞 Création du numéro...');
      const number = await db.createNumber({
        PhoneNumber: phoneNumber,
        Reseau: reseau,
        UserKey: userId,
        isVerified: true,
        verifiedAt: new Date().toISOString(),
      });
      
      Logger.info('NumberService', '💰 Création du solde...');
      await db.createSold({
        NumberKey: number.Id,
        CurrentBalance: soldeInitial,
        LastTransactionDate: new Date().toISOString(),
      });

      Logger.success('NumberService', `✅ Numéro et solde enregistrés avec succès`);
      return { success: true, number, message: 'Numéro enregistré avec succès' };

    } catch (error) {
      Logger.error('NumberService', `❌ EXCEPTION: ${error.message}`);
      return { success: false, message: `Erreur: ${error.message}` };
    }
  }

  /**
   * Récupère tous les numéros avec leur solde
   */
  static async getNumerosAvecSolde(userId = null) {
    Logger.info('NumberService', '🔍 DÉBUT getNumerosAvecSolde()');
    Logger.info('NumberService', `📥 userId: ${userId}`);
    
    try {
      Logger.info('NumberService', '📞 Récupération de tous les numéros...');
      const numbers = await db.getAllNumbers(userId);
      
      Logger.info('NumberService', `📊 ${numbers.length} numéro(s) trouvé(s)`);
      
      const result = [];

      for (const number of numbers) {
        Logger.debug('NumberService', `🔍 Traitement: ${number.PhoneNumber}`);
        
        const sold = await db.getSoldByNumberId(number.Id);
        
        const soldeValue = sold ? parseFloat(sold.CurrentBalance) : 0;
        
        result.push({
          Id: number.Id,
          PhoneNumber: number.PhoneNumber,
          Reseau: number.Reseau,
          UserKey: number.UserKey,
          isActive: number.isActive,
          isVerified: number.isVerified,
          Solde: soldeValue,
          LastUpdate: sold?.LastTransactionDate,
          createdAt: number.createdAt,
        });
      }

      Logger.success('NumberService', `✅ ${result.length} numéro(s) récupéré(s) avec soldes`);
      
      if (result.length > 0) {
        Logger.info('NumberService', `📋 Premier numéro: ${JSON.stringify(result[0])}`);
      }
      
      return result;

    } catch (error) {
      Logger.error('NumberService', `❌ EXCEPTION: ${error.message}`);
      Logger.error('NumberService', `❌ Stack: ${error.stack}`);
      return [];
    }
  }

  /**
   * Met à jour le solde d'un numéro
   */
  static async updateSolde(numberId, nouveauSolde) {
    try {
      Logger.info('NumberService', `💰 Mise à jour du solde: ${numberId} → ${nouveauSolde} FCFA`);

      const sold = await db.getSoldByNumberId(numberId);
      if (!sold) {
        throw new Error('Solde non trouvé pour ce numéro');
      }

      await db.updateSold(sold.Id, {
        CurrentBalance: nouveauSolde,
        LastTransactionDate: new Date().toISOString(),
      });

      Logger.success('NumberService', `✅ Solde mis à jour avec succès`);
      return { success: true };

    } catch (error) {
      Logger.error('NumberService', `❌ Erreur: ${error.message}`);
      return { success: false, message: error.message };
    }
  }

  /**
   * Supprime un numéro
   */
  static async supprimerNumero(numberId) {
    try {
      Logger.info('NumberService', `🗑️ Suppression du numéro: ${numberId}`);
      await db.deleteNumber(numberId);
      Logger.success('NumberService', `✅ Numéro supprimé`);
      return { success: true };
    } catch (error) {
      Logger.error('NumberService', `❌ Erreur: ${error.message}`);
      return { success: false, message: error.message };
    }
  }

  /**
   * Rafraîchit le solde d'un numéro
   */
  static async refreshBalance(numberId) {
    try {
      Logger.info('NumberService', `🔄 Rafraîchissement du solde: ${numberId}`);
      
      const sold = await db.getSoldByNumberId(numberId);
      if (!sold) {
        throw new Error('Solde non trouvé');
      }

      Logger.success('NumberService', `✅ Solde actuel: ${sold.CurrentBalance} FCFA`);
      return { 
        success: true, 
        solde: parseFloat(sold.CurrentBalance) 
      };

    } catch (error) {
      Logger.error('NumberService', `❌ Erreur: ${error.message}`);
      return { success: false };
    }
  }
}

// Exports nommés
export const getRegisteredNumbers = () => NumberService.getNumerosAvecSolde();
export const refreshBalance = (numberId) => NumberService.refreshBalance(numberId);
export const enregistrerNumero = (phone, reseau, solde, userId) => 
  NumberService.enregistrerNumero(phone, reseau, solde, userId);
export const updateSolde = (numberId, nouveauSolde) => 
  NumberService.updateSolde(numberId, nouveauSolde);
export const supprimerNumero = (numberId) => 
  NumberService.supprimerNumero(numberId);

export default NumberService;