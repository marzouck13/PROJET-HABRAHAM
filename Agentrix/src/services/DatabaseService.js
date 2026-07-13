import AsyncStorage from '@react-native-async-storage/async-storage';
import { Logger } from './LoggerService';

class DatabaseService {
  constructor() {
    this.initialized = false;
    // Structure alignée exactement sur vos modèles Sequelize
    this.storage = {
      users: [],
      numbers: [],
      solds: [],
      transactions: [], // Correspond au modèle Transacs
      histories: [],
    };
  }

  generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  async initialize() {
    if (this.initialized) {
      Logger.info('Database', '⚠️ Base déjà initialisée');
      return;
    }

    try {
      Logger.info('Database', '🚀 Initialisation de la base de données (AsyncStorage)...');
      
      // Chargement parallèle ultra-rapide
      const keys = ['@db_users', '@db_numbers', '@db_solds', '@db_transactions', '@db_histories'];
      const results = await AsyncStorage.multiGet(keys);

      this.storage.users = results[0][1] ? JSON.parse(results[0][1]) : [];
      this.storage.numbers = results[1][1] ? JSON.parse(results[1][1]) : [];
      this.storage.solds = results[2][1] ? JSON.parse(results[2][1]) : [];
      this.storage.transactions = results[3][1] ? JSON.parse(results[3][1]) : [];
      this.storage.histories = results[4][1] ? JSON.parse(results[4][1]) : [];

      Logger.info('Database', `📊 Données chargées: Users(${this.storage.users.length}), Numbers(${this.storage.numbers.length}), Solds(${this.storage.solds.length}), Transacs(${this.storage.transactions.length}), Histories(${this.storage.histories.length})`);

      this.initialized = true;
      Logger.success('Database', '✅ Base de données initialisée avec succès');
    } catch (error) {
      Logger.error('Database', `❌ Erreur d'initialisation: ${error.message}`);
      throw error;
    }
  }

  async save() {
    try {
      await AsyncStorage.multiSet([
        ['@db_users', JSON.stringify(this.storage.users)],
        ['@db_numbers', JSON.stringify(this.storage.numbers)],
        ['@db_solds', JSON.stringify(this.storage.solds)],
        ['@db_transactions', JSON.stringify(this.storage.transactions)],
        ['@db_histories', JSON.stringify(this.storage.histories)],
      ]);
      Logger.debug('Database', '💾 Données sauvegardées avec succès');
    } catch (error) {
      Logger.error('Database', `❌ Erreur de sauvegarde: ${error.message}`);
      throw error;
    }
  }

  // ===== USERS =====
  async createUser(userData) {
    const user = {
      Id: this.generateUUID(),
      Name: userData.Name || '',
      Email: userData.Email,
      Password: userData.Password || '',
      isEmailVerified: userData.isEmailVerified || false,
      isPhoneVerified: userData.isPhoneVerified || false,
      isFullyVerified: userData.isFullyVerified || false,
      emailVerifiedAt: userData.emailVerifiedAt || null,
      phoneVerifiedAt: userData.phoneVerifiedAt || null,
      isActive: userData.isActive !== undefined ? userData.isActive : true,
      isSent: userData.isSent || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.storage.users.push(user);
    await this.save();
    return user;
  }

  async getUserByEmail(email) {
    return this.storage.users.find(u => u.Email === email) || null;
  }

  // ===== NUMBERS =====
  async createNumber(numberData) {
    const number = {
      Id: this.generateUUID(),
      PhoneNumber: numberData.PhoneNumber,
      Reseau: numberData.Reseau,
      UserKey: numberData.UserKey || null,
      isActive: numberData.isActive !== undefined ? numberData.isActive : true,
      isVerified: numberData.isVerified || false,
      verifiedAt: numberData.verifiedAt || null,
      isSent: numberData.isSent || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.storage.numbers.push(number);
    await this.save();
    return number;
  }

  async getNumberByPhone(phoneNumber) {
    return this.storage.numbers.find(n => n.PhoneNumber === phoneNumber) || null;
  }

  async getNumberById(id) {
    return this.storage.numbers.find(n => n.Id === id) || null;
  }

  async getAllNumbers(userId = null) {
    if (userId) {
      return this.storage.numbers.filter(n => n.UserKey === userId);
    }
    return this.storage.numbers;
  }

  async updateNumber(id, updates) {
    const index = this.storage.numbers.findIndex(n => n.Id === id);
    if (index === -1) throw new Error('Numéro non trouvé');
    
    this.storage.numbers[index] = {
      ...this.storage.numbers[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    await this.save();
    return this.storage.numbers[index];
  }

  async deleteNumber(id) {
    this.storage.numbers = this.storage.numbers.filter(n => n.Id !== id);
    this.storage.solds = this.storage.solds.filter(s => s.NumberKey !== id);
    this.storage.transactions = this.storage.transactions.filter(t => t.NumberKey !== id);
    await this.save();
  }

  // ===== SOLDS =====
  async createSold(soldData) {
    const sold = {
      Id: this.generateUUID(),
      NumberKey: soldData.NumberKey,
      CurrentBalance: parseFloat(soldData.CurrentBalance) || 0,
      LastTransactionDate: soldData.LastTransactionDate || new Date().toISOString(),
      isSent: soldData.isSent || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.storage.solds.push(sold);
    await this.save();
    return sold;
  }

  async getSoldByNumberId(numberId) {
    return this.storage.solds.find(s => s.NumberKey === numberId) || null;
  }

  async updateSold(id, updates) {
    const index = this.storage.solds.findIndex(s => s.Id === id);
    if (index === -1) throw new Error('Solde non trouvé');
    
    this.storage.solds[index] = {
      ...this.storage.solds[index],
      ...updates,
      CurrentBalance: updates.CurrentBalance !== undefined ? parseFloat(updates.CurrentBalance) : this.storage.solds[index].CurrentBalance,
      updatedAt: new Date().toISOString(),
    };
    await this.save();
    return this.storage.solds[index];
  }

  // ===== TRANSACS (Transactions) =====
  async createTransaction(transacData) {
    const transaction = {
      Id: this.generateUUID(),
      UserKey: transacData.UserKey || null,
      NumberKey: transacData.NumberKey,
      Type: transacData.Type, // DEPOT, RETRAIT, COMMISSION, AJUSTEMENT
      Amount: parseFloat(transacData.Amount) || 0,
      BalanceBefore: parseFloat(transacData.BalanceBefore) || 0,
      BalanceAfter: parseFloat(transacData.BalanceAfter) || 0,
      Reseau: transacData.Reseau,
      isSent: transacData.isSent || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.storage.transactions.push(transaction);
    await this.save();
    return transaction;
  }

  async getTransactionsByNumber(numberId) {
    return this.storage.transactions
      .filter(t => t.NumberKey === numberId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  // ===== HISTORIES =====
  async createHistory(historyData) {
    const history = {
      Id: this.generateUUID(),
      UserKey: historyData.UserKey || null,
      NumberKey: historyData.NumberKey || null,
      TransacsKey: historyData.TransacsKey || null,
      DateKey: historyData.DateKey || new Date().toISOString().split('T')[0],
      DayString: historyData.DayString || new Date().toLocaleDateString('fr-FR', { weekday: 'long' }),
      Year: historyData.Year || new Date().getFullYear(),
      Month: historyData.Month || new Date().getMonth() + 1,
      TotalDepots: parseFloat(historyData.TotalDepots) || 0,
      TotalRetraits: parseFloat(historyData.TotalRetraits) || 0,
      TotalCommissions: parseFloat(historyData.TotalCommissions) || 0,
      isSent: historyData.isSent || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.storage.histories.push(history);
    await this.save();
    return history;
  }

  async getAllHistories(userId = null) {
    if (userId) {
      return this.storage.histories.filter(h => h.UserKey === userId);
    }
    return this.storage.histories;
  }

  // ===== DEBUG =====
  async getStats() {
    return {
      users: this.storage.users.length,
      numbers: this.storage.numbers.length,
      solds: this.storage.solds.length,
      transactions: this.storage.transactions.length,
      histories: this.storage.histories.length,
    };
  }

  async reset() {
    this.storage = { users: [], numbers: [], solds: [], transactions: [], histories: [] };
    await this.save();
    Logger.warn('Database', '🗑️ Base de données réinitialisée');
  }
}

const db = new DatabaseService();
export default db;