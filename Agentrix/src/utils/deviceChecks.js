// agentrix/src/utils/deviceChecks.js

import { NativeModules, Platform } from 'react-native';

const { MomoAutomationModule } = NativeModules;

/**
 * Vérifie si le service USSD est disponible sur l'appareil
 * @returns {boolean}
 */
export function isUssdAvailable() {
  return Platform.OS === 'android' && MomoAutomationModule != null;
}

/**
 * Vérifie si le Notification Listener est actif
 * @returns {Promise<boolean>}
 */
export async function isNotificationListenerActive() {
  if (!isUssdAvailable()) return false;
  
  try {
    await MomoAutomationModule.initializeNotificationListener();
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Vérifie si toutes les permissions SMS sont accordées
 * @returns {Promise<boolean>}
 */
export async function hasSmsPermissions() {
  if (Platform.OS !== 'android') return false;
  
  try {
    const { PermissionsAndroid } = require('react-native');
    
    const permissions = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.READ_SMS,
      PermissionsAndroid.PERMISSIONS.SEND_SMS,
      PermissionsAndroid.PERMISSIONS.RECEIVE_SMS,
    ]);
    
    return Object.values(permissions).every(
      status => status === PermissionsAndroid.RESULTS.GRANTED
    );
  } catch (error) {
    return false;
  }
}

/**
 * Vérifie si la permission CALL_PHONE est accordée
 * @returns {Promise<boolean>}
 */
export async function hasCallPermission() {
  if (Platform.OS !== 'android') return false;
  
  try {
    const { PermissionsAndroid } = require('react-native');
    
    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CALL_PHONE
    );
    
    return result === PermissionsAndroid.RESULTS.GRANTED;
  } catch (error) {
    return false;
  }
}

/**
 * Retourne un diagnostic complet de l'état des services
 * @returns {Promise<Object>}
 */
export async function getFullDiagnostic() {
  const diagnostic = {
    platform: Platform.OS,
    isAndroid: Platform.OS === 'android',
    moduleAvailable: isUssdAvailable(),
    notificationActive: false,
    smsPermissions: false,
    callPermission: false,
  };
  
  if (Platform.OS === 'android') {
    diagnostic.notificationActive = await isNotificationListenerActive();
    diagnostic.smsPermissions = await hasSmsPermissions();
    diagnostic.callPermission = await hasCallPermission();
  }
  
  return diagnostic;
}