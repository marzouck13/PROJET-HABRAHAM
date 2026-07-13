// src/components/AccessibilityGuide.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Couleurs } from '../styles/ThemeAgentrix';
import { useAccessibilityService } from '../hooks/useAccessibilityService';
import { Logger } from '../services/LoggerService';

export default function AccessibilityGuide({ onActive }) {
  const { 
    isEnabled, 
    isLoading, 
    fabricant,
    checkService, 
    openAccessibilitySettings,
    openAppSettings
  } = useAccessibilityService();
  
  const [isChecking, setIsChecking] = useState(false);
  const [etape, setEtape] = useState(1);

  useEffect(() => {
    if (isEnabled) {
      Logger.success('AccessibilityGuide', '✅ Service activé !');
      if (onActive) onActive();
    }
  }, [isEnabled]);

  const getInstructionsEtape1 = () => {
  // ✅ CORRECTION : Protection contre undefined/null
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
  // ✅ CORRECTION : Protection contre undefined/null
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
    setIsChecking(true);
    try {
      const enabled = await checkService();
      if (!enabled) {
        Alert.alert(
          'Service non activé',
          'Le service n\'est pas encore actif. Assurez-vous d\'avoir complété les 2 étapes.',
          [{ text: 'OK' }]
        );
      }
    } catch (e) {
      Alert.alert('Erreur', e.message);
    }
    setIsChecking(false);
  };

  const ouvrirParametresApp = async () => {
    try {
      const success = await openAppSettings();
      if (!success) {
        Alert.alert('Erreur', 'Impossible d\'ouvrir les paramètres');
        return;
      }
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
      Alert.alert('Erreur', e.message);
    }
  };

  const ouvrirParametresAccessibilite = async () => {
    try {
      const success = await openAccessibilitySettings();
      if (!success) {
        Alert.alert('Erreur', 'Impossible d\'ouvrir les paramètres');
      }
    } catch (e) {
      Alert.alert('Erreur', e.message);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Couleurs.vertAgentrix} />
          <Text style={styles.loadingText}>Vérification du service...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isEnabled) {
    return null;
  }

  const instructionsEtape1 = getInstructionsEtape1();
  const instructionsEtape2 = getInstructionsEtape2();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons name="shield-alert" size={60} color={Couleurs.vertAgentrix} />
          </View>
          <Text style={styles.titre}>Configuration Requise</Text>
          <Text style={styles.sousTitre}>
            Pour fonctionner, Agentrix nécessite 2 autorisations de sécurité
          </Text>
        </View>

        {/* INDICATEUR D'ÉTAPES */}
        <View style={styles.etapesIndicator}>
          <View style={[styles.etapeDot, etape === 1 && styles.etapeDotActive]}>
            <Text style={[styles.etapeDotTexte, etape === 1 && styles.etapeDotTexteActive]}>1</Text>
          </View>
          <View style={styles.etapeLigne} />
          <View style={[styles.etapeDot, etape === 2 && styles.etapeDotActive]}>
            <Text style={[styles.etapeDotTexte, etape === 2 && styles.etapeDotTexteActive]}>2</Text>
          </View>
        </View>

        {/* ÉTAPE 1 */}
        {etape === 1 && (
          <>
            <View style={[styles.card, styles.cardImportant]}>
              <Text style={styles.cardTitre}>
                ⚠️ Étape 1 : Autoriser les paramètres restreints
              </Text>
              <Text style={styles.explication}>
                Android bloque l'activation des services d'accessibilité pour les apps non installées depuis le Play Store. Cette étape lève cette restriction.
              </Text>
              {instructionsEtape1.map((instruction, index) => (
                <View key={index} style={styles.etapeItem}>
                  <View style={styles.etapeNumero}>
                    <Text style={styles.etapeNumeroTexte}>{index + 1}</Text>
                  </View>
                  <Text style={styles.etapeTexte}>{instruction}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity 
              style={styles.btnPrincipal}
              onPress={ouvrirParametresApp}
            >
              <MaterialCommunityIcons name="cog" size={22} color="#FFF" />
              <Text style={styles.btnPrincipalTexte}>Ouvrir les paramètres de l'app</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.btnSecondaire}
              onPress={() => setEtape(2)}
            >
              <Text style={styles.btnSecondaireTexte}>
                J'ai déjà fait l'étape 1 → Passer à l'étape 2
              </Text>
            </TouchableOpacity>
          </>
        )}

        {/* ÉTAPE 2 */}
        {etape === 2 && (
          <>
            <View style={[styles.card, styles.cardImportant]}>
              <Text style={styles.cardTitre}>
                ✅ Étape 2 : Activer le service d'accessibilité
              </Text>
              <Text style={styles.explication}>
                Maintenant que la restriction est levée, vous pouvez activer le service qui permet à Agentrix de lire les réponses USSD.
              </Text>
              {instructionsEtape2.map((instruction, index) => (
                <View key={index} style={styles.etapeItem}>
                  <View style={styles.etapeNumero}>
                    <Text style={styles.etapeNumeroTexte}>{index + 1}</Text>
                  </View>
                  <Text style={styles.etapeTexte}>{instruction}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity 
              style={styles.btnPrincipal}
              onPress={ouvrirParametresAccessibilite}
            >
              <MaterialCommunityIcons name="human-accessibility" size={22} color="#FFF" />
              <Text style={styles.btnPrincipalTexte}>Ouvrir les paramètres d'accessibilité</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.btnSecondaire}
              onPress={verifierService}
              disabled={isChecking}
            >
              {isChecking ? (
                <ActivityIndicator color={Couleurs.vertAgentrix} />
              ) : (
                <>
                  <MaterialCommunityIcons name="check-circle" size={20} color={Couleurs.vertAgentrix} />
                  <Text style={styles.btnSecondaireTexte}>J'ai activé, vérifier maintenant</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.btnRetour}
              onPress={() => setEtape(1)}
            >
              <MaterialCommunityIcons name="arrow-left" size={18} color="#6B7280" />
              <Text style={styles.btnRetourTexte}>Retour à l'étape 1</Text>
            </TouchableOpacity>
          </>
        )}

        {/* NOTE DE SÉCURITÉ */}
        <View style={styles.note}>
          <MaterialCommunityIcons name="lock" size={16} color="#666" />
          <Text style={styles.noteTexte}>
            Vos données restent sur votre téléphone. Agentrix ne collecte aucune information personnelle.
          </Text>
        </View>

        {/* INFO FABRICANT */}
        {fabricant ? (
          <View style={styles.fabricantInfo}>
            <MaterialCommunityIcons name="cellphone" size={14} color="#6B7280" />
            <Text style={styles.fabricantInfoTexte}>
              Appareil détecté : {fabricant}
            </Text>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Couleurs.texteGris,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  titre: {
    fontSize: 24,
    fontWeight: '800',
    color: Couleurs.texteNoir,
    textAlign: 'center',
  },
  sousTitre: {
    marginTop: 10,
    fontSize: 14,
    color: Couleurs.texteGris,
    textAlign: 'center',
    lineHeight: 20,
  },
  etapesIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  etapeDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  etapeDotActive: {
    backgroundColor: Couleurs.vertAgentrix,
  },
  etapeDotTexte: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '700',
  },
  etapeDotTexteActive: {
    color: '#fff',
  },
  etapeLigne: {
    width: 60,
    height: 2,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 10,
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  cardImportant: {
    borderLeftWidth: 4,
    borderLeftColor: Couleurs.vertAgentrix,
  },
  cardTitre: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
    color: Couleurs.texteNoir,
  },
  explication: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    marginBottom: 15,
    fontStyle: 'italic',
  },
  etapeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  etapeNumero: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Couleurs.vertAgentrix,
    justifyContent: 'center',
    alignItems: 'center',
  },
  etapeNumeroTexte: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  etapeTexte: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    marginLeft: 12,
  },
  btnPrincipal: {
    backgroundColor: Couleurs.vertAgentrix,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: Couleurs.vertAgentrix,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  btnPrincipalTexte: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  btnSecondaire: {
    backgroundColor: '#fff',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Couleurs.vertAgentrix,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  btnSecondaireTexte: {
    color: Couleurs.vertAgentrix,
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
  },
  btnRetour: {
    backgroundColor: 'transparent',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 5,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  btnRetourTexte: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  note: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  noteTexte: {
    flex: 1,
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
    marginLeft: 8,
  },
  fabricantInfo: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  fabricantInfoTexte: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 6,
  },
});