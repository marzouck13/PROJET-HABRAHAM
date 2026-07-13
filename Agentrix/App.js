// App.js
import React, { useState, useEffect, Component } from 'react';
import {
  DeviceEventEmitter,
  LogBox,
  NativeModules,
  Alert,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  AppState,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ✅ IMPORT MANQUANT AJOUTÉ
import { LOG_EVENT_NAME, Logger } from './src/services/LoggerService';

// Imports des écrans
import EcranChargement from './src/components/EcranChargement';
import OnboardingScreen from './src/screens/OnboardingScreen';
import ConnexionScreen from './src/screens/ConnexionScreen';
import InscriptionScreen from './src/screens/InscriptionScreen';
import OublieMdpScreen from './src/screens/OublieMdpScreen';
import Pilote1Screen from './src/screens/Pilote1Screen';
import TransfertScreen from './src/screens/TransfertScreen';
import ForfaitScreen from './src/screens/ForfaitScreen';
import AddNumberScreen from './src/screens/AddNumberScreen';
import HistoriqueScreen from './src/screens/HistoriqueScreen';
import ProfilScreen from './src/screens/ProfilScreen';
import DatabaseDebugScreen from './src/screens/DatabaseDebugScreen';

LogBox.ignoreAllLogs();

const MomoAutomationModule = NativeModules.MomoAutomationModule;
const NATIVE_LOG_EVENT_NAME = 'MOMO_NATIVE_LOG';

// ============================================
// ERROR BOUNDARY
// ============================================
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('🚨 ERREUR:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <SafeAreaView style={styles.errorContainer}>
          <Text style={styles.errorTitre}>🚨 Erreur</Text>
          <Text style={styles.errorMessage}>
            {this.state.error?.message || 'Une erreur est survenue'}
          </Text>
          <TouchableOpacity 
            style={styles.errorBtn}
            onPress={() => this.setState({ hasError: false, error: null })}
          >
            <Text style={styles.errorBtnTexte}>Réessayer</Text>
          </TouchableOpacity>
        </SafeAreaView>
      );
    }
    return this.props.children;
  }
}

// ============================================
// GUIDE D'ACCESSIBILITÉ
// ============================================
const GuideAccessibilite = ({ onActive }) => {
  const [isChecking, setIsChecking] = useState(false);
  const [fabricant, setFabricant] = useState('');
  const [etape, setEtape] = useState(1);

  useEffect(() => {
    const detecter = async () => {
      try {
        if (MomoAutomationModule && MomoAutomationModule.getDeviceManufacturer) {
          const fab = await MomoAutomationModule.getDeviceManufacturer();
          if (typeof fab === 'string' && fab.length > 0) {
            setFabricant(fab);
          } else {
            setFabricant('');
          }
        }
      } catch (e) {
        setFabricant('');
      }
    };
    detecter();
  }, []);

  const getInstructionsEtape1 = () => {
    const fab = (fabricant || '').toLowerCase();
    
    if (fab.includes('samsung')) {
      return [
        'Cliquez sur "Ouvrir les paramètres de l\'app"',
        'En haut à droite, appuyez sur les ⋮ (3 points)',
        'Sélectionnez "Autoriser les paramètres restreints"',
        'Confirmez avec votre code PIN ou empreinte'
      ];
    } else if (fab.includes('xiaomi') || fab.includes('redmi') || fab.includes('poco')) {
      return [
        'Cliquez sur "Ouvrir les paramètres de l\'app"',
        'Cherchez "Autres paramètres" ou "Permissions"',
        'Activez "Autoriser les paramètres restreints"',
        'Confirmez si demandé'
      ];
    } else if (fab.includes('tecno') || fab.includes('infinix') || fab.includes('itel')) {
      return [
        'Cliquez sur "Ouvrir les paramètres de l\'app"',
        'En haut à droite, appuyez sur les ⋮ (3 points)',
        'Sélectionnez "Autoriser les paramètres restreints"',
        'Confirmez avec votre code PIN'
      ];
    } else if (fab.includes('huawei') || fab.includes('honor')) {
      return [
        'Cliquez sur "Ouvrir les paramètres de l\'app"',
        'Allez dans "Permissions" ou "Sécurité"',
        'Activez les permissions restreintes',
        'Confirmez si demandé'
      ];
    } else {
      return [
        'Cliquez sur "Ouvrir les paramètres de l\'app"',
        'En haut à droite, appuyez sur les ⋮ (3 points)',
        'Sélectionnez "Autoriser les paramètres restreints"',
        'Confirmez avec votre code PIN ou empreinte'
      ];
    }
  };

  const getInstructionsEtape2 = () => {
    const fab = (fabricant || '').toLowerCase();
    
    if (fab.includes('samsung')) {
      return [
        'Cliquez sur "Ouvrir les paramètres d\'accessibilité"',
        'Allez dans "Services installés" ou "Applications"',
        'Cherchez "Agentrix" dans la liste',
        'Activez l\'interrupteur et confirmez'
      ];
    } else if (fab.includes('xiaomi') || fab.includes('redmi') || fab.includes('poco')) {
      return [
        'Cliquez sur "Ouvrir les paramètres d\'accessibilité"',
        'Descendez jusqu\'à "Agentrix"',
        'Activez l\'interrupteur du service',
        'Confirmez avec "OK"'
      ];
    } else {
      return [
        'Cliquez sur "Ouvrir les paramètres d\'accessibilité"',
        'Cherchez "Agentrix" dans la liste',
        'Cliquez dessus',
        'Activez l\'interrupteur et confirmez'
      ];
    }
  };

  const verifierService = async () => {
    if (!MomoAutomationModule || !MomoAutomationModule.isAccessibilityServiceEnabled) {
      Alert.alert('Erreur', 'Module non disponible');
      return;
    }
    
    setIsChecking(true);
    try {
      const enabled = await MomoAutomationModule.isAccessibilityServiceEnabled();
      if (enabled) {
        if (onActive) onActive();
      } else {
        Alert.alert(
          'Service non activé',
          'Le service n\'est pas encore actif. Avez-vous complété les 2 étapes ?',
          [{ text: 'OK' }]
        );
      }
    } catch (e) {
      Alert.alert('Erreur', e.message || 'Erreur inconnue');
    }
    setIsChecking(false);
  };

  const ouvrirParametresApp = async () => {
    if (!MomoAutomationModule || !MomoAutomationModule.openAppSettings) {
      Alert.alert('Erreur', 'Module non disponible');
      return;
    }
    
    try {
      await MomoAutomationModule.openAppSettings();
      setTimeout(() => {
        Alert.alert(
          '✅ Étape 1 terminée ?',
          'Avez-vous autorisé les paramètres restreints ?',
          [
            { text: 'Non, pas encore', style: 'cancel' },
            { text: 'Oui, étape suivante', onPress: () => setEtape(2) }
          ]
        );
      }, 3000);
    } catch (e) {
      Alert.alert('Erreur', e.message || 'Erreur inconnue');
    }
  };

  const ouvrirParametresAccessibilite = async () => {
    if (!MomoAutomationModule || !MomoAutomationModule.openAccessibilitySettings) {
      Alert.alert('Erreur', 'Module non disponible');
      return;
    }
    
    try {
      await MomoAutomationModule.openAccessibilitySettings();
    } catch (e) {
      Alert.alert('Erreur', e.message || 'Erreur inconnue');
    }
  };

  const instructionsEtape1 = getInstructionsEtape1();
  const instructionsEtape2 = getInstructionsEtape2();

  return (
    <SafeAreaView style={styles.guideContainer}>
      <ScrollView contentContainerStyle={styles.guideScroll}>
        <View style={styles.guideHeader}>
          <View style={styles.guideIconContainer}>
            <Text style={styles.guideIcon}>🛡️</Text>
          </View>
          <Text style={styles.guideTitre}>Configuration Requise</Text>
          <Text style={styles.guideSousTitre}>
            Pour fonctionner, Agentrix nécessite 2 autorisations de sécurité
          </Text>
        </View>

        <View style={styles.etapesIndicator}>
          <View style={[styles.etapeDot, etape === 1 && styles.etapeDotActive]}>
            <Text style={[styles.etapeDotTexte, etape === 1 && styles.etapeDotTexteActive]}>1</Text>
          </View>
          <View style={styles.etapeLigne} />
          <View style={[styles.etapeDot, etape === 2 && styles.etapeDotActive]}>
            <Text style={[styles.etapeDotTexte, etape === 2 && styles.etapeDotTexteActive]}>2</Text>
          </View>
        </View>

        {etape === 1 && (
          <>
            <View style={[styles.guideCard, styles.guideCardImportant]}>
              <Text style={styles.guideCardTitre}>
                ⚠️ Étape 1 : Autoriser les paramètres restreints
              </Text>
              <Text style={styles.guideExplication}>
                Android bloque l'activation des services d'accessibilité pour les apps non installées depuis le Play Store. Cette étape lève cette restriction.
              </Text>
              {instructionsEtape1.map((instruction, index) => (
                <View key={index} style={styles.guideEtape}>
                  <View style={styles.guideEtapeNumero}>
                    <Text style={styles.guideEtapeNumeroTexte}>{index + 1}</Text>
                  </View>
                  <Text style={styles.guideEtapeTexte}>{instruction}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity 
              style={styles.guideBtnPrincipal}
              onPress={ouvrirParametresApp}
            >
              <Text style={styles.guideBtnPrincipalTexte}>
                📱 Ouvrir les paramètres de l'app
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.guideBtnSecondaire}
              onPress={() => setEtape(2)}
            >
              <Text style={styles.guideBtnSecondaireTexte}>
                J'ai déjà fait l'étape 1 → Passer à l'étape 2
              </Text>
            </TouchableOpacity>
          </>
        )}

        {etape === 2 && (
          <>
            <View style={[styles.guideCard, styles.guideCardImportant]}>
              <Text style={styles.guideCardTitre}>
                ✅ Étape 2 : Activer le service d'accessibilité
              </Text>
              <Text style={styles.guideExplication}>
                Maintenant que la restriction est levée, vous pouvez activer le service qui permet à Agentrix de lire les réponses USSD.
              </Text>
              {instructionsEtape2.map((instruction, index) => (
                <View key={index} style={styles.guideEtape}>
                  <View style={styles.guideEtapeNumero}>
                    <Text style={styles.guideEtapeNumeroTexte}>{index + 1}</Text>
                  </View>
                  <Text style={styles.guideEtapeTexte}>{instruction}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity 
              style={styles.guideBtnPrincipal}
              onPress={ouvrirParametresAccessibilite}
            >
              <Text style={styles.guideBtnPrincipalTexte}>
                ♿ Ouvrir les paramètres d'accessibilité
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.guideBtnSecondaire}
              onPress={verifierService}
              disabled={isChecking}
            >
              {isChecking ? (
                <ActivityIndicator color="#065f46" />
              ) : (
                <Text style={styles.guideBtnSecondaireTexte}>
                  ✓ J'ai activé, vérifier maintenant
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.guideBtnRetour}
              onPress={() => setEtape(1)}
            >
              <Text style={styles.guideBtnRetourTexte}>
                ← Retour à l'étape 1
              </Text>
            </TouchableOpacity>
          </>
        )}

        <View style={styles.guideNote}>
          <Text style={styles.guideNoteIcon}>🔒</Text>
          <Text style={styles.guideNoteTexte}>
            Vos données restent sur votre téléphone. Agentrix ne collecte aucune information personnelle.
          </Text>
        </View>

        {fabricant ? (
          <View style={styles.fabricantInfo}>
            <Text style={styles.fabricantInfoTexte}>
              📱 Appareil détecté : {fabricant}
            </Text>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
};

// ============================================
// COMPOSANT PRINCIPAL APP
// ============================================
export default function App() {
  const [etatApp, setEtatApp] = useState('CHARGEMENT');
  const [serviceActive, setServiceActive] = useState(false);
  const [serviceVerifie, setServiceVerifie] = useState(false);
  const [historiqueLogs, setHistoriqueLogs] = useState([]);
  const [moduleEstActif, setModuleEstActif] = useState(false);

  const verifierServiceAccessibilite = async () => {
    if (!MomoAutomationModule || !MomoAutomationModule.isAccessibilityServiceEnabled) {
      setServiceVerifie(true);
      setServiceActive(false);
      return;
    }

    try {
      const enabled = await MomoAutomationModule.isAccessibilityServiceEnabled();
      setServiceActive(enabled === true);
      setServiceVerifie(true);
    } catch (e) {
      setServiceActive(false);
      setServiceVerifie(true);
    }
  };

  const verifierModule = () => {
    try {
      if (MomoAutomationModule && typeof MomoAutomationModule.sendUssd === 'function') {
        setModuleEstActif(true);
      } else {
        setModuleEstActif(false);
      }
    } catch (e) {
      setModuleEstActif(false);
    }
  };

useEffect(() => {
  const initialiser = async () => {
    try {
      Logger.info('App', '🚀 Initialisation de la base de données...');
      const db = require('./src/services/DatabaseService').default;
      await db.initialize();
      Logger.success('App', '✅ Base de données initialisée');
      
      // Vérifier les stats
      const stats = await db.getStats();
      Logger.info('App', `📊 Stats BDD: ${JSON.stringify(stats)}`);
    } catch (error) {
      Logger.error('App', `❌ Erreur initialisation BDD: ${error.message}`);
      Logger.error('App', `❌ Stack: ${error.stack}`);
    }
  };
  
  initialiser();
  verifierServiceAccessibilite();
  verifierModule();

  const subNative = DeviceEventEmitter.addListener(NATIVE_LOG_EVENT_NAME, (message) => {
    const horodatage = new Date().toLocaleTimeString();
    setHistoriqueLogs(prev => [`[${horodatage}] [NATIF] ${message}`, ...prev].slice(0, 100));
  });

  const subJs = DeviceEventEmitter.addListener(LOG_EVENT_NAME, (message) => {
    setHistoriqueLogs(prev => [message, ...prev].slice(0, 100));
  });

  return () => {
    if (subNative && subNative.remove) subNative.remove();
    if (subJs && subJs.remove) subJs.remove();
  };
}, []);

  useEffect(() => {
    const appStateSub = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active' && !serviceActive) {
        verifierServiceAccessibilite();
      }
    });

    return () => {
      if (appStateSub && appStateSub.remove) appStateSub.remove();
    };
  }, [serviceActive]);

  useEffect(() => {
    if (serviceActive && etatApp === 'CHARGEMENT') {
      setTimeout(() => setEtatApp('PILOTE1'), 500);
    }
  }, [serviceActive, etatApp]);

  const afficherLogs = () => {
    Alert.alert(
      `📋 Logs (${historiqueLogs.length})`,
      historiqueLogs.length > 0 ? historiqueLogs.slice(0, 20).join('\n\n') : 'Aucun log',
      [{ text: 'Fermer' }]
    );
  };

  const rendreEcran = () => {
    if (serviceVerifie && !serviceActive) {
      return (
        <GuideAccessibilite 
          onActive={() => {
            setServiceActive(true);
            setEtatApp('PILOTE1');
          }} 
        />
      );
    }

    switch (etatApp) {
      case 'CHARGEMENT':
        return <EcranChargement />;
      
      case 'ONBOARDING':
        return (
          <OnboardingScreen
            auAllerConnexion={() => {
              AsyncStorage.setItem('@deja_visite', 'true').catch(() => {});
              setEtatApp('CONNEXION');
            }}
            auAllerInscription={() => {
              AsyncStorage.setItem('@deja_visite', 'true').catch(() => {});
              setEtatApp('INSCRIPTION');
            }}
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
      
      case 'HISTORIQUE': 
        return <HistoriqueScreen setAppState={setEtatApp} />;
      
      case 'PROFIL': 
        return <ProfilScreen setAppState={setEtatApp} />;
      
      case 'ADD_NUMBER': 
        return <AddNumberScreen setAppState={setEtatApp} />;
      
      case 'DEBUG_BDD':
        return <DatabaseDebugScreen setAppState={setEtatApp} />;
      
      default: 
        return <EcranChargement />;
    }
  };

  return (
    <ErrorBoundary>
      <View style={styles.conteneur}>
        {rendreEcran()}
        
        {etatApp !== 'CHARGEMENT' && serviceActive && (
          <TouchableOpacity
            style={[styles.boutonLogs, moduleEstActif ? styles.boutonActif : styles.boutonInactif]}
            onPress={afficherLogs}
          >
            <Text style={styles.texteBouton}>📋</Text>
            <Text style={styles.compteurLogs}>{historiqueLogs.length}</Text>
          </TouchableOpacity>
        )}
      </View>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  conteneur: { flex: 1 },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#FEF2F2' },
  errorTitre: { fontSize: 22, fontWeight: '800', marginBottom: 12 },
  errorMessage: { fontSize: 14, color: '#7F1D1D', textAlign: 'center', marginBottom: 20 },
  errorBtn: { backgroundColor: '#DC2626', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10 },
  errorBtnTexte: { color: '#FFF', fontWeight: '700' },
  boutonLogs: { position: 'absolute', bottom: 30, right: 20, width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', elevation: 5 },
  boutonActif: { backgroundColor: '#10B981' },
  boutonInactif: { backgroundColor: '#9CA3AF' },
  texteBouton: { fontSize: 22 },
  compteurLogs: { position: 'absolute', top: -4, right: -4, backgroundColor: '#DC2626', color: '#FFF', fontSize: 11, fontWeight: '700', paddingHorizontal: 5, borderRadius: 10, overflow: 'hidden' },
  guideContainer: { flex: 1, backgroundColor: '#F9FAFB' },
  guideScroll: { padding: 20 },
  guideHeader: { alignItems: 'center', marginBottom: 20 },
  guideIconContainer: { marginBottom: 10 },
  guideIcon: { fontSize: 40 },
  guideTitre: { fontSize: 22, fontWeight: '800', color: '#111827' },
  guideSousTitre: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginTop: 6 },
  etapesIndicator: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  etapeDot: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#E5E7EB', justifyContent: 'center', alignItems: 'center' },
  etapeDotActive: { backgroundColor: '#10B981' },
  etapeDotTexte: { fontWeight: '700', color: '#6B7280' },
  etapeDotTexteActive: { color: '#FFF' },
  etapeLigne: { width: 40, height: 2, backgroundColor: '#E5E7EB', marginHorizontal: 6 },
  guideCard: { backgroundColor: '#FFF', borderRadius: 14, padding: 16, marginBottom: 16 },
  guideCardImportant: { borderWidth: 1.5, borderColor: '#FDE68A' },
  guideCardTitre: { fontSize: 16, fontWeight: '800', marginBottom: 8, color: '#111827' },
  guideExplication: { fontSize: 13, color: '#6B7280', marginBottom: 12, lineHeight: 18 },
  guideEtape: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  guideEtapeNumero: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#10B981', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  guideEtapeNumeroTexte: { color: '#FFF', fontWeight: '700', fontSize: 12 },
  guideEtapeTexte: { flex: 1, fontSize: 13, color: '#374151', lineHeight: 18 },
  guideBtnPrincipal: { backgroundColor: '#10B981', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginBottom: 10 },
  guideBtnPrincipalTexte: { color: '#FFF', fontWeight: '700' },
  guideBtnSecondaire: { backgroundColor: '#D1FAE5', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginBottom: 10 },
  guideBtnSecondaireTexte: { color: '#065F46', fontWeight: '700' },
  guideBtnRetour: { alignItems: 'center', paddingVertical: 10 },
  guideBtnRetourTexte: { color: '#6B7280', fontWeight: '600' },
  guideNote: { flexDirection: 'row', backgroundColor: '#F3F4F6', padding: 14, borderRadius: 10, marginTop: 10, alignItems: 'center' },
  guideNoteIcon: { fontSize: 18, marginRight: 10 },
  guideNoteTexte: { flex: 1, fontSize: 12, color: '#6B7280', lineHeight: 16 },
  fabricantInfo: { marginTop: 14, alignItems: 'center' },
  fabricantInfoTexte: { fontSize: 12, color: '#9CA3AF' },
});