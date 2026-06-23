import React, { useState, useEffect, useRef } from 'react';
import { DeviceEventEmitter, LogBox, NativeModules, Alert, View, Text, TouchableOpacity, StyleSheet } from 'react-native'; 
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

// Récupération du pont natif traditionnel
const MomoAutomationModule = NativeModules.MomoAutomationModule;

export default function App() {
  const [etatApp, setEtatApp] = useState('CHARGEMENT');
  const [historiqueLogs, setHistoriqueLogs] = useState([]);
  const [moduleEstActif, setModuleEstActif] = useState(false); // État de santé du module natif
  
  const intervalleVerification = useRef(null);

  // Enregistre un événement dans l'historique visible sur le téléphone
  const notifierEvenement = (titre, message) => {
    const horodatage = new Date().toLocaleTimeString();
    const nouvelleLigne = `[${horodatage}] ${titre}: ${message}`;
    setHistoriqueLogs(prevLogs => [nouvelleLigne, ...prevLogs]);
  };

  // Fonction de vérification de l'état du module et de ses services
  const verifierStatutModuleEnContinu = async () => {
    // 1. Vérification de la présence physique de la classe Native
    if (!MomoAutomationModule) {
      if (moduleEstActif !== false) {
        setModuleEstActif(false);
        notifierEvenement("CRITIQUE", "Le module Kotlin s'est déconnecté ou est introuvable !");
      }
      return;
    }

    // 2. Test d'appel de fonction (Ping) pour valider que les services répondent
    if (typeof MomoAutomationModule.initializeNotificationListener === 'function') {
      try {
        // On effectue un micro-appel pour s'assurer que le thread natif répond toujours
        const statutInterne = await MomoAutomationModule.initializeNotificationListener();
        if (statutInterne && !moduleEstActif) {
          setModuleEstActif(true);
          notifierEvenement("STATUT", "Module Kotlin détecté et Services USSD/SMS DISPONIBLES ✅");
        }
      } catch (erreur) {
        if (moduleEstActif !== false) {
          setModuleEstActif(false);
          notifierEvenement("ERREUR SERVICE", `Le module est présent mais indisponible : ${erreur.message}`);
        }
      }
    } else {
      if (moduleEstActif !== false) {
        setModuleEstActif(false);
        notifierEvenement("STRUCTURE", "La méthode de vérification est absente du module Kotlin.");
      }
    }
  };

  // Affichage manuel de l'historique complet lors de l'appui sur le bouton
  const afficherRapportGlobal = () => {
    const statutActuel = moduleEstActif ? "🟢 ACTIF (Services OK)" : "🔴 INACTIF (Indisponible)";
    const entete = `Statut actuel : ${statutActuel}\n\n`;
    
    if (historiqueLogs.length === 0) {
      Alert.alert("Moniteur Natif", `${entete}Aucun événement enregistré.`, [{ text: "Fermer" }]);
    } else {
      Alert.alert(
        "Moniteur d'Automatisation", 
        entete + historiqueLogs.join("\n\n"), 
        [{ text: "Fermer" }]
      );
    }
  };

  useEffect(() => {
    verifierFluxUtilisateur();
    
    if (ussdService && typeof ussdService.initialize === 'function') {
      ussdService.initialize().catch(err => 
        notifierEvenement("UssdService JS", `Échec initialisation passive: ${err.message}`)
      );
    }

    // Premier test immédiat au démarrage
    verifierStatutModuleEnContinu();

    // Configuration de la vérification continue (toutes les 3000ms / 3 secondes)
    intervalleVerification.current = setInterval(() => {
      verifierStatutModuleEnContinu();
    }, 3000);

    // Écoute dynamique des SMS intercepte par le module
    let abonnementSms = null;
    if (MomoAutomationModule) {
      abonnementSms = DeviceEventEmitter.addListener('onSmsReceived', (evenement) => {
        const corpsMessage = evenement?.text || "Aucun contenu texte";
        notifierEvenement("SMS REÇU", `Contenu : ${corpsMessage}`);
        Alert.alert("SMS Intercepté", corpsMessage);
      });
    }

    return () => {
      if (intervalleVerification.current) {
        clearInterval(intervalleVerification.current);
      }
      if (abonnementSms) {
        abonnementSms.remove();
      }
    };
  }, []);

  const verifierFluxUtilisateur = async () => {
    try {
      const dejaVisite = await AsyncStorage.getItem('@deja_visite');
      setTimeout(() => {
        if (dejaVisite === 'true') {
          setEtatApp('PILOTE1'); 
        } else {
          setEtatApp('ONBOARDING');
        }
      }, 2000);
    } catch (e) {
      setEtatApp('ONBOARDING');
    }
  };

  const finaliserOnboarding = async (prochainEcran) => {
    try {
      await AsyncStorage.setItem('@deja_visite', 'true');
    } catch (e) {
      notifierEvenement("AsyncStorage", `Erreur : ${e.message}`);
    }
    setEtatApp(prochainEcran);
  };

  const rendreEcranCourant = () => {
    switch (etatApp) {
      case 'CHARGEMENT': return <EcranChargement />;
      case 'ONBOARDING': return <OnboardingScreen auAllerConnexion={() => finaliserOnboarding('CONNEXION')} auAllerInscription={() => finaliserOnboarding('INSCRIPTION')} />;
      case 'CONNEXION': return <ConnexionScreen auInscription={() => setEtatApp('INSCRIPTION')} auRetour={() => setEtatApp('ONBOARDING')} auOublieMdp={() => setEtatApp('OUBLIE_MDP')} />;
      case 'INSCRIPTION': return <InscriptionScreen auConnexion={() => setEtatApp('CONNEXION')} auRetour={() => setEtatApp('CONNEXION')} />;
      case 'OUBLIE_MDP': return <OublieMdpScreen auRetour={() => setEtatApp('CONNEXION')} />;
      case 'PILOTE1': return <Pilote1Screen setAppState={setEtatApp} />;
      case 'TRANSFERT': return <TransfertScreen setAppState={setEtatApp} />;
      case 'FORFAIT': return <ForfaitScreen setAppState={setEtatApp} />;
      default: return <EcranChargement />;
    }
  };

  return (
    <View style={styles.conteneurGlobal}>
      {rendreEcranCourant()}

      {/* Bouton de log dynamique changeant de couleur selon la disponibilité réelle du module */}
      {etatApp !== 'CHARGEMENT' && (
        <TouchableOpacity 
          style={[styles.boutonInspecteur, moduleEstActif ? styles.boutonActif : styles.boutonInactif]} 
          onPress={afficherRapportGlobal}
        >
          <Text style={styles.texteBouton}>
            {moduleEstActif ? "🟢 Module OK" : "🔴 Module DOWN"}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  conteneurGlobal: {
    flex: 1,
  },
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
  boutonActif: {
    backgroundColor: '#065f46', // Vert foncé si les services répondent
  },
  boutonInactif: {
    backgroundColor: '#991b1b', // Rouge si la liaison coupe ou est inexistante
  },
  texteBouton: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  }
});