import React, { useState, useEffect, useRef } from 'react';
import {
  DeviceEventEmitter,
  LogBox,
  NativeModules,
  Alert,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import EcranChargement from './src/components/EcranChargement';
import OnboardingScreen from './src/screens/OnboardingScreen';
import ConnexionScreen from './src/screens/ConnexionScreen';
import InscriptionScreen from './src/screens/InscriptionScreen';
import OublieMdpScreen from './src/screens/OublieMdpScreen';
import Pilote1Screen from './src/screens/Pilote1Screen';
import TransfertScreen from './src/screens/TransfertScreen';
import ForfaitScreen from './src/screens/ForfaitScreen';
import { ussdService } from './src/services/ussd';

LogBox.ignoreLogs(['Setting a timer']);

// Module natif (pour info, mais pas utilisé pour bloquer)
const MomoAutomationModule = NativeModules.MomoAutomationModule;

export default function App() {
  const [etatApp, setEtatApp] = useState('CHARGEMENT');
  const [historiqueLogs, setHistoriqueLogs] = useState([]);
  const [moduleEstActif, setModuleEstActif] = useState(false);
  const intervalleVerification = useRef(null);

  // ----- Fonctions (en français) -----
  const ajouterEvenement = (titre, message) => {
    const horodatage = new Date().toLocaleTimeString();
    setHistoriqueLogs(prev => [`[${horodatage}] ${titre}: ${message}`, ...prev]);
  };

  // Vérification passive (juste pour le diagnostic, pas de conséquence)
  const verifierModule = async () => {
    if (!MomoAutomationModule) {
      setModuleEstActif(false);
      ajouterEvenement('INFO', 'Module Kotlin non détecté (mode libre)');
      return;
    }
    try {
      const statut = await MomoAutomationModule.initializeNotificationListener();
      setModuleEstActif(!!statut);
      ajouterEvenement('INFO', `Module ${statut ? 'actif' : 'inactif'} (mode libre)`);
    } catch {
      setModuleEstActif(false);
      ajouterEvenement('INFO', 'Erreur de vérification (mode libre)');
    }
  };

  const afficherHistorique = () => {
    const statut = moduleEstActif ? '🟢 ACTIF' : '🔴 INACTIF';
    const entete = `Statut : ${statut}\n\n`;
    Alert.alert(
      'Moniteur d\'automatisation',
      entete + (historiqueLogs.length ? historiqueLogs.join('\n\n') : 'Aucun événement.')
    );
  };

  const verifierPremiereVisite = async () => {
    try {
      const dejaVisite = await AsyncStorage.getItem('@deja_visite');
      setTimeout(() => {
        await AsyncStorage.clear();
        setEtatApp(dejaVisite === 'true' ? 'PILOTE1' : 'ONBOARDING');
      }, 2000);
    } catch {
      setEtatApp('ONBOARDING');
    }
  };

  const terminerOnboarding = async (prochainEcran) => {
    await AsyncStorage.setItem('@deja_visite', 'true');
    setEtatApp(prochainEcran);
  };

  // ----- Effets -----
  useEffect(() => {
    verifierPremiereVisite();

    if (ussdService?.initialize) {
      ussdService.initialize().catch(() => {});
    }

    verifierModule(); // appel initial

    intervalleVerification.current = setInterval(verifierModule, 5000);

    let abonnementSms = null;
    if (MomoAutomationModule) {
      abonnementSms = DeviceEventEmitter.addListener('onSmsReceived', (event) => {
        const texte = event?.text || 'Aucun contenu';
        ajouterEvenement('SMS reçu', texte);
        Alert.alert('SMS intercepté', texte);
      });
    }

    return () => {
      clearInterval(intervalleVerification.current);
      if (abonnementSms) abonnementSms.remove();
    };
  }, []);

  // ----- Rendu : AUCUNE CONTRAINTE, tous les écrans accessibles -----
  const rendreEcranCourant = () => {
    switch (etatApp) {
      case 'CHARGEMENT':
        return <EcranChargement />;
      case 'ONBOARDING':
        return (
          <OnboardingScreen
            auAllerConnexion={() => terminerOnboarding('CONNEXION')}
            auAllerInscription={() => terminerOnboarding('INSCRIPTION')}
          />
        );
      case 'CONNEXION':
        return (
          <ConnexionScreen
            auInscription={() => setEtatApp('INSCRIPTION')}
            auRetour={() => setEtatApp('ONBOARDING')}
            auOublieMdp={() => setEtatApp('OUBLIE_MDP')}
          />
        );
      case 'INSCRIPTION':
        return (
          <InscriptionScreen
            auConnexion={() => setEtatApp('CONNEXION')}
            auRetour={() => setEtatApp('CONNEXION')}
          />
        );
      case 'OUBLIE_MDP':
        return <OublieMdpScreen auRetour={() => setEtatApp('CONNEXION')} />;
      case 'PILOTE1':
        return <Pilote1Screen setAppState={setEtatApp} />;
      case 'TRANSFERT':
        return <TransfertScreen setAppState={setEtatApp} />;
      case 'FORFAIT':
        return <ForfaitScreen setAppState={setEtatApp} />;
      default:
        return <EcranChargement />;
    }
  };

  return (
    <View style={styles.conteneur}>
      {rendreEcranCourant()}

      {/* Bouton de diagnostic flottant (sans effet sur la navigation) */}
      {etatApp !== 'CHARGEMENT' && (
        <TouchableOpacity
          style={[
            styles.boutonInspecteur,
            moduleEstActif ? styles.boutonActif : styles.boutonInactif,
          ]}
          onPress={afficherHistorique}
        >
          <Text style={styles.texteBouton}>
            {moduleEstActif ? '🟢 Module OK' : '🔴 Module ?'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  conteneur: { flex: 1 },
  boutonInspecteur: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 25,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    zIndex: 9999,
  },
  boutonActif: { backgroundColor: '#065f46' },
  boutonInactif: { backgroundColor: '#991b1b' },
  texteBouton: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
});