// src/services/LoggerService.js
import { DeviceEventEmitter } from 'react-native';

const EVENT_NAME = 'APP_LOG';

class LoggerService {
  constructor() {
    this.logs = [];
    this.maxLogs = 100;
  }

  /**
   * Ajoute un log et l'émet via DeviceEventEmitter
   */
  log(titre, message, type = 'INFO') {
    const horodatage = new Date().toLocaleTimeString();
    const entry = `[${horodatage}] [${type}] ${titre}: ${message}`;
    
    this.logs.unshift(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }
    
    // Émet l'événement pour que App.js le reçoive
    DeviceEventEmitter.emit(EVENT_NAME, entry);
    
    // Log aussi dans la console (utile en debug)
    console.log(entry);
  }

  info(titre, message) {
    this.log(titre, message, 'INFO');
  }

  success(titre, message) {
    this.log(titre, message, '✅');
  }

  error(titre, message) {
    this.log(titre, message, '❌');
  }

  warn(titre, message) {
    this.log(titre, message, '⚠️');
  }

  debug(titre, message) {
    this.log(titre, message, '🔍');
  }

  clear() {
    this.logs = [];
  }

  getLogs() {
    return this.logs;
  }
}

// Instance singleton
export const Logger = new LoggerService();
export const LOG_EVENT_NAME = EVENT_NAME;