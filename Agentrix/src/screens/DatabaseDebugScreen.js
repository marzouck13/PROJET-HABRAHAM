// src/screens/DatabaseDebugScreen.js
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity,
  ScrollView, Alert, ActivityIndicator
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Couleurs } from '../styles/ThemeAgentrix';
import { DatabaseDebugService } from '../services/DatabaseDebugService';
import { Logger } from '../services/LoggerService';

export default function DatabaseDebugScreen({ setAppState }) {
  const [chargement, setChargement] = useState(false);
  const [rapport, setRapport] = useState(null);

  const lancerDiagnostic = async () => {
    setChargement(true);
    try {
      Logger.info('Debug', '🔍 Lancement du diagnostic...');
      const result = await DatabaseDebugService.diagnostiquer();
      setRapport(result);
      Logger.success('Debug', '✅ Diagnostic terminé');
    } catch (error) {
      Logger.error('Debug', `❌ Erreur: ${error.message}`);
      Alert.alert('Erreur', error.message);
    }
    setChargement(false);
  };

  const reinitialiserBDD = () => {
    Alert.alert(
      'Réinitialiser la BDD ?',
      'Toutes les données seront supprimées. Cette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Réinitialiser', 
          style: 'destructive',
          onPress: async () => {
            setChargement(true);
            try {
              const result = await DatabaseDebugService.reinitialiser();
              if (result.success) {
                Alert.alert('Succès', 'Base de données réinitialisée');
                lancerDiagnostic();
              } else {
                Alert.alert('Erreur', result.error);
              }
            } catch (error) {
              Alert.alert('Erreur', error.message);
            }
            setChargement(false);
          }
        }
      ]
    );
  };

  const forcerSauvegarde = async () => {
    setChargement(true);
    try {
      const result = await DatabaseDebugService.forcerSauvegarde();
      if (result.success) {
        Alert.alert('Succès', 'Sauvegarde forcée avec succès');
        lancerDiagnostic();
      } else {
        Alert.alert('Erreur', result.error);
      }
    } catch (error) {
      Alert.alert('Erreur', error.message);
    }
    setChargement(false);
  };

  const testerAsyncStorage = async () => {
    setChargement(true);
    try {
      const result = await DatabaseDebugService.testerAsyncStorage();
      Alert.alert(
        result.success ? '✅ Test Réussi' : '❌ Test Échoué',
        result.message || result.error
      );
    } catch (error) {
      Alert.alert('Erreur', error.message);
    }
    setChargement(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setAppState?.('PILOTE1')}>
          <MaterialCommunityIcons name="arrow-left" size={28} color={Couleurs.texteNoir} />
        </TouchableOpacity>
        <Text style={styles.titre}>🔧 Debug Base de Données</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* BOUTONS D'ACTION */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={styles.btnAction}
            onPress={lancerDiagnostic}
            disabled={chargement}
          >
            <MaterialCommunityIcons name="magnify" size={24} color="#FFF" />
            <Text style={styles.btnTexte}>Lancer Diagnostic</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.btnAction, styles.btnDanger]}
            onPress={reinitialiserBDD}
            disabled={chargement}
          >
            <MaterialCommunityIcons name="delete" size={24} color="#FFF" />
            <Text style={styles.btnTexte}>Réinitialiser BDD</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.btnAction, styles.btnWarning]}
            onPress={forcerSauvegarde}
            disabled={chargement}
          >
            <MaterialCommunityIcons name="content-save" size={24} color="#FFF" />
            <Text style={styles.btnTexte}>Forcer Sauvegarde</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.btnAction, styles.btnInfo]}
            onPress={testerAsyncStorage}
            disabled={chargement}
          >
            <MaterialCommunityIcons name="test-tube" size={24} color="#FFF" />
            <Text style={styles.btnTexte}>Tester AsyncStorage</Text>
          </TouchableOpacity>
        </View>
        // Dans DatabaseDebugScreen.js, ajoutez ce bouton :
<TouchableOpacity 
  style={[styles.btnAction, { backgroundColor: '#8B5CF6' }]}
  onPress={() => {
    const { testerParsing } = require('../services/UssdParserTest');
    testerParsing();
    Alert.alert('Test Parsing', 'Tests lancés, vérifiez les logs');
  }}
  disabled={chargement}
>
  <MaterialCommunityIcons name="code-braces" size={24} color="#FFF" />
  <Text style={styles.btnTexte}>Tester Parsing USSD</Text>
</TouchableOpacity>
        {chargement && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Couleurs.vertAgentrix} />
            <Text style={styles.loadingText}>Traitement en cours...</Text>
          </View>
        )}

        {/* RAPPORT */}
        {rapport && !chargement && (
          <View style={styles.rapportContainer}>
            <Text style={styles.rapportTitre}>📊 Rapport de Diagnostic</Text>
            
            <View style={styles.section}>
              <Text style={styles.sectionTitre}>État de la Base</Text>
              <Text style={styles.infoText}>
                Initialisée: {rapport.database.initialized ? '✅ Oui' : '❌ Non'}
              </Text>
              <Text style={styles.infoText}>
                Users: {rapport.database.storage.users}
              </Text>
              <Text style={styles.infoText}>
                Numbers: {rapport.database.storage.numbers}
              </Text>
              <Text style={styles.infoText}>
                Soldes: {rapport.database.storage.solds}
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitre}>AsyncStorage</Text>
              <Text style={styles.infoText}>
                Clés trouvées: {rapport.asyncStorage.keys?.length || 0}
              </Text>
              {rapport.asyncStorage.keys?.filter(k => k.startsWith('@db_')).map(key => (
                <View key={key} style={styles.keyItem}>
                  <Text style={styles.keyText}>{key}</Text>
                  <Text style={styles.valueText}>
                    {rapport.asyncStorage[key]?.count || 'objet'}
                  </Text>
                </View>
              ))}
            </View>

            {rapport.errors.length > 0 && (
              <View style={[styles.section, styles.errorSection]}>
                <Text style={styles.sectionTitre}>❌ Erreurs Détectées</Text>
                {rapport.errors.map((error, index) => (
                  <Text key={index} style={styles.errorText}>• {error}</Text>
                ))}
              </View>
            )}

            <TouchableOpacity 
              style={styles.btnVoirDetails}
              onPress={() => Alert.alert('Détails', JSON.stringify(rapport, null, 2))}
            >
              <Text style={styles.btnVoirDetailsTexte}>Voir Détails Complets</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 15, backgroundColor: '#FFF',
    borderBottomWidth: 1, borderBottomColor: '#E5E7EB'
  },
  titre: { fontSize: 18, fontWeight: '700', color: '#111827' },
  content: { flex: 1, padding: 20 },
  actionsContainer: { marginBottom: 20 },
  btnAction: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: Couleurs.vertAgentrix, borderRadius: 12,
    paddingVertical: 14, marginBottom: 10, gap: 10
  },
  btnDanger: { backgroundColor: '#EF4444' },
  btnWarning: { backgroundColor: '#F59E0B' },
  btnInfo: { backgroundColor: '#3B82F6' },
  btnTexte: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  loadingContainer: { alignItems: 'center', paddingVertical: 40 },
  loadingText: { marginTop: 15, fontSize: 14, color: '#6B7280' },
  rapportContainer: {
    backgroundColor: '#FFF', borderRadius: 12, padding: 20,
    borderWidth: 1, borderColor: '#E5E7EB'
  },
  rapportTitre: { fontSize: 18, fontWeight: '700', marginBottom: 20, color: '#111827' },
  section: { marginBottom: 20 },
  sectionTitre: { fontSize: 16, fontWeight: '700', marginBottom: 10, color: '#374151' },
  infoText: { fontSize: 14, color: '#6B7280', marginBottom: 5 },
  keyItem: {
    flexDirection: 'row', justifyContent: 'space-between',
    backgroundColor: '#F3F4F6', padding: 10, borderRadius: 8, marginBottom: 5
  },
  keyText: { fontSize: 13, fontWeight: '600', color: '#374151' },
  valueText: { fontSize: 13, color: '#6B7280' },
  errorSection: { backgroundColor: '#FEF2F2', padding: 15, borderRadius: 8 },
  errorText: { fontSize: 13, color: '#DC2626', marginBottom: 5 },
  btnVoirDetails: {
    backgroundColor: '#F3F4F6', borderRadius: 10, paddingVertical: 12,
    alignItems: 'center', marginTop: 10
  },
  btnVoirDetailsTexte: { fontSize: 14, fontWeight: '600', color: '#374151' }
});