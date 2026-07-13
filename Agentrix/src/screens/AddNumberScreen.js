// src/screens/AddNumberScreen.js
import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, Alert, ActivityIndicator, DeviceEventEmitter,
  NativeModules, Platform, PermissionsAndroid, Linking
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Couleurs } from '../styles/ThemeAgentrix';
import { detectOperator } from '../services/operatorDetection';
import { getSoldeCode } from '../services/ussd/UssdCodes';
import { analyzeUssdResponse } from '../services/ussd/UssdParser';
import { enregistrerNumero } from '../services/NumberService';
import { Logger } from '../services/LoggerService';

const MomoModule = NativeModules.MomoAutomationModule;

// Nom de l'événement émis par le module natif quand une réponse USSD est reçue
// (à ajuster selon ce que votre module natif émet réellement)
const USSD_RESPONSE_EVENT = 'USSD_RESPONSE_RECEIVED';

export default function AddNumberScreen({ setAppState }) {
  const [numero, setNumero] = useState('');
  const [operateurDetecte, setOperateurDetecte] = useState(null);
  const [codeUssd, setCodeUssd] = useState('');
  const [etape, setEtape] = useState(1);
  const [chargement, setChargement] = useState(false);
  const [reponseUssd, setReponseUssd] = useState(null);

  // ✅ Écouter les événements natifs pour la réponse USSD
  useEffect(() => {
    Logger.info('AddNumber', '📡 Inscription à l\'événement USSD_RESPONSE_RECEIVED');
    
    const subscription = DeviceEventEmitter.addListener(USSD_RESPONSE_EVENT, (response) => {
      Logger.info('AddNumber', '📨 ═══════════════════════════════════');
      Logger.info('AddNumber', '📨 ÉVÉNEMENT USSD_RESPONSE_RECEIVED REÇU!');
      Logger.info('AddNumber', `📨 Type: ${typeof response}`);
      Logger.info('AddNumber', `📨 Valeur: ${JSON.stringify(response)}`);
      
      // Le module natif peut envoyer soit une string, soit un objet
      let texteBrut = '';
      
      if (typeof response === 'string') {
        texteBrut = response;
      } else if (response && typeof response === 'object') {
        // Adapter selon la structure de votre module natif
        texteBrut = response.message || response.text || response.data || response.toString();
      }
      
      Logger.info('AddNumber', `📨 Texte extrait: "${texteBrut}"`);
      Logger.info('AddNumber', `📨 Longueur: ${texteBrut?.length || 0}`);
      
      if (texteBrut && chargement) {
        Logger.info('AddNumber', '✅ Réponse reçue pendant le chargement, traitement...');
        setReponseUssd(texteBrut);
        gererResultatUssd(texteBrut);
      } else {
        Logger.warn('AddNumber', '⚠️ Réponse reçue mais chargement=false, ignorée');
      }
      
      Logger.info('AddNumber', '📨 ═══════════════════════════════════');
    });

    return () => {
      Logger.info('AddNumber', '📡 Désinscription de l\'événement USSD');
      subscription.remove();
    };
  }, [chargement]);

  const handleNumeroChange = (text) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    setNumero(cleaned);
    if (cleaned.length >= 8) {
      const op = detectOperator(cleaned);
      setOperateurDetecte(op);
      setCodeUssd(op ? getSoldeCode(op) : '');
    } else {
      setOperateurDetecte(null);
      setCodeUssd('');
    }
  };

  const demanderPermission = async () => {
    if (Platform.OS !== 'android') return false;
    try {
      const permissions = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.CALL_PHONE,
        PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE
      ]);
      return (
        permissions[PermissionsAndroid.PERMISSIONS.CALL_PHONE] === 'granted' &&
        permissions[PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE] === 'granted'
      );
    } catch {
      return false;
    }
  };

  const lancerVerification = async () => {
    Logger.info('AddNumber', '🚀 ═══════════════════════════════════');
    Logger.info('AddNumber', '🚀 DÉBUT lancerVerification()');
    
    if (!operateurDetecte || !codeUssd) {
      Logger.warn('AddNumber', '❌ Opérateur ou code USSD manquant');
      return Alert.alert('Erreur', 'Opérateur non détecté ou indisponible.');
    }

    if (!MomoModule?.sendUssd) {
      Logger.error('AddNumber', '❌ Module MomoAutomationModule introuvable');
      return Alert.alert('Erreur Technique', 'Le module d\'automatisation USSD est introuvable.');
    }

    const aLesPermissions = await demanderPermission();
    if (!aLesPermissions) {
      Logger.warn('AddNumber', '⚠️ Permissions refusées');
      return Alert.alert(
        'Permissions Requises',
        'L\'accès au téléphone est nécessaire pour valider la carte SIM de ce numéro.',
        [
          { text: 'Annuler', style: 'cancel' },
          { text: 'Paramètres', onPress: () => Linking.openSettings() }
        ]
      );
    }

    Logger.info('AddNumber', '✅ Permissions OK, passage à l\'étape 2');
    setEtape(2);
    setChargement(true);
    setReponseUssd(null);

    try {
      Logger.info('AddNumber', `📡 Envoi USSD: ${codeUssd}`);
      Logger.info('AddNumber', '⏳ En attente de la réponse via événement natif...');
      
      // Appeler sendUssd mais NE PAS attendre de retour
      // La réponse viendra via l'événement USSD_RESPONSE_RECEIVED
      const result = MomoModule.sendUssd(codeUssd);
      
      Logger.info('AddNumber', `📦 sendUssd() a retourné: ${typeof result}`);
      Logger.info('AddNumber', `📦 Valeur: ${JSON.stringify(result)}`);
      
      // Si sendUssd retourne une Promise qui se résout avec la réponse
      if (result && typeof result.then === 'function') {
        Logger.info('AddNumber', '📦 C\'est une Promise, on attend...');
        
        // Timeout de 30 secondes
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Timeout: aucune réponse après 30s')), 30000);
        });
        
        try {
          const reponseBrute = await Promise.race([result, timeoutPromise]);
          Logger.info('AddNumber', `✅ Promise résolue: "${reponseBrute}"`);
          
          if (reponseBrute && !reponseUssd) {
            // Si on reçoit la réponse via la Promise (pas via l'événement)
            Logger.info('AddNumber', '✅ Réponse reçue via Promise, traitement...');
            setReponseUssd(reponseBrute);
            await gererResultatUssd(reponseBrute);
          }
        } catch (error) {
          Logger.warn('AddNumber', `⚠️ Promise rejetée ou timeout: ${error.message}`);
          // On continue, la réponse peut encore arriver via l'événement
        }
      }
      
    } catch (error) {
      Logger.error('AddNumber', `❌ EXCEPTION: ${error.message}`);
      Logger.error('AddNumber', `❌ Stack: ${error.stack}`);
      
      setChargement(false);
      setEtape(1);
      
      Alert.alert('Échec Réseau', error.message || 'La session USSD a été interrompue.');
    }
    
    Logger.info('AddNumber', '🏁 FIN lancerVerification()');
    Logger.info('AddNumber', '🚀 ═══════════════════════════════════');
  };

    const gererResultatUssd = async (texteBrut) => {
    setChargement(false);

    // 🚨 TEST DE VÉRITÉ : Affiche une alerte visible même en mode Release
    Alert.alert(
      "🔍 DEBUG USSD REÇU",
      `Texte brut reçu :\n${JSON.stringify(texteBrut)}\n\nOpérateur détecté : ${operateurDetecte}`,
      [{ text: "OK" }]
    );

    if (!texteBrut || String(texteBrut).trim() === "") {
      Logger.warn('AddNumber', 'Message vide reçu du module natif');
      setEtape(1);
      return Alert.alert('Échec', 'Aucune donnée reçue du module natif.');
    }

    let status, data;
    try {
      const resultat = analyzeUssdResponse(texteBrut, operateurDetecte);
      status = resultat.status;
      data = resultat.data;
      
      // Deuxième alerte pour voir le résultat du parseur
      Alert.alert(
        "🔍 RÉSULTAT PARSEUR",
        `Status: ${status}\nDonnée extraite: ${data}`,
        [{ text: "OK" }]
      );

    } catch (e) {
      setEtape(1);
      return Alert.alert('Erreur de Lecture', `Impossible d'interpréter: ${e.message}`);
    }

    switch (status) {
      case 'SUCCESS':
      case 'SUCCESS_INCERTAIN':
        await enregistrerNumeroValide(data);
        break;
      case 'WRONG_PIN':
        setEtape(1);
        Alert.alert('Alerte Sécurité', 'Le code PIN saisi est incorrect.');
        break;
      case 'TIMEOUT':
        setEtape(1);
        Alert.alert('Délai Expiré', 'Trop de temps pour saisir le PIN.');
        break;
      default:
        setEtape(1);
        Alert.alert('Vérification Échouée', `Réponse brute: "${texteBrut}"`);
        break;
    }
  };

      const enregistrerNumeroValide = async (solde) => {
    // ✅ Sécurisation : garantit que le solde est un nombre valide
    const soldeValide = parseFloat(solde) || 0;
    
    try {
      const resultat = await enregistrerNumero(numero, operateurDetecte, soldeValide);
      
      if (!resultat.success) {
        return Alert.alert('Information', resultat.message);
      }

      Alert.alert(
        'Numéro Vérifié',
        `Le numéro a été ajouté avec succès.\nSolde validé : ${soldeValide.toLocaleString()} FCFA`,
        [{ text: 'Terminer', onPress: () => setAppState?.('PILOTE1') }]
      );
    } catch (e) {
      Logger.error('AddNumber', `❌ Erreur: ${e.message}`);
      Alert.alert('Erreur Interne', e.message);
    }
  };

  const boutonDesactive = !operateurDetecte || chargement;

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => {
          setEtape(1);
          setAppState?.('PILOTE1');
        }}
      >
        <MaterialCommunityIcons name="arrow-left" size={28} color={Couleurs.texteNoir} />
      </TouchableOpacity>

      {etape === 1 ? (
        <View style={styles.content}>
          <Text style={styles.titre}>Ajouter un numéro</Text>
          <Text style={styles.sousTitre}>Une requête USSD sécurisée sera envoyée pour valider que cette SIM vous appartient.</Text>

          <Text style={styles.label}>Numéro de téléphone</Text>
          <View style={styles.inputWrapper}>
            <MaterialCommunityIcons name="cellphone" size={20} color={Couleurs.texteGris} style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Ex: 07XXXXXXXX"
              placeholderTextColor={Couleurs.texteGris}
              keyboardType="phone-pad"
              value={numero}
              onChangeText={handleNumeroChange}
              maxLength={10}
            />
          </View>

          {operateurDetecte && (
            <View style={styles.operateurBox}>
              <MaterialCommunityIcons name="check-circle" size={18} color={Couleurs.vertAgentrix} />
              <Text style={styles.operateurTexte}>Réseau détecté : {operateurDetecte}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.btn, boutonDesactive && styles.btnDisabled]}
            onPress={lancerVerification}
            disabled={boutonDesactive}
          >
            <Text style={styles.btnTexte}>Lancer la vérification SIM</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.content}>
          <Text style={styles.titre}>Validation Sécurisée</Text>
          <ActivityIndicator size="large" color={Couleurs.vertAgentrix} style={{ marginVertical: 30 }} />
          <Text style={styles.attenteTexte}>Traitement de la demande auprès de {operateurDetecte}...</Text>
          <Text style={styles.codeTexte}>{codeUssd}</Text>
          <View style={styles.AvisPinBox}>
            <MaterialCommunityIcons name="shield-lock" size={24} color={Couleurs.texteGris} />
            <Text style={styles.pinTexte}>
              Veuillez valider l'écran système Android en saisissant votre code PIN secret pour prouver votre identité.
            </Text>
          </View>
          
          {/* ✅ Affichage de la réponse reçue */}
          {reponseUssd && (
            <View style={{ marginTop: 20, padding: 10, backgroundColor: '#D1FAE5', borderRadius: 8 }}>
              <Text style={{ fontSize: 12, color: '#065F46', fontWeight: '600' }}>
                ✅ Réponse reçue :
              </Text>
              <Text style={{ fontSize: 11, color: '#065F46', marginTop: 5 }}>
                {reponseUssd}
              </Text>
            </View>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Couleurs.fond },
  backBtn: { marginTop: 50, marginLeft: 20, width: 40, height: 40, justifyContent: 'center' },
  content: { flex: 1, paddingHorizontal: 20, justifyContent: 'center' },
  titre: { fontSize: 24, fontWeight: '800', color: Couleurs.texteNoir, textAlign: 'center', marginBottom: 8 },
  sousTitre: { fontSize: 14, color: Couleurs.texteGris, textAlign: 'center', marginBottom: 25, paddingHorizontal: 10 },
  label: { fontSize: 14, fontWeight: '700', color: Couleurs.texteNoir, marginBottom: 8 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 14, height: 54 },
  icon: { marginRight: 10 },
  input: { flex: 1, fontSize: 17, fontWeight: '600', color: Couleurs.texteNoir },
  operateurBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 12 },
  operateurTexte: { fontSize: 14, color: Couleurs.vertAgentrix, fontWeight: '600', marginLeft: 6 },
  btn: { backgroundColor: Couleurs.vertAgentrix, borderRadius: 14, height: 56, justifyContent: 'center', alignItems: 'center', marginTop: 25 },
  btnDisabled: { opacity: 0.4 },
  btnTexte: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  attenteTexte: { fontSize: 15, color: Couleurs.texteNoir, textAlign: 'center', fontWeight: '600' },
  codeTexte: { fontSize: 22, color: Couleurs.vertAgentrix, textAlign: 'center', fontWeight: '800', marginTop: 10, letterSpacing: 3 },
  AvisPinBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', padding: 15, borderRadius: 10, marginTop: 30 },
  pinTexte: { flex: 1, fontSize: 13, color: Couleurs.texteGris, marginLeft: 10, lineHeight: 18 },
});