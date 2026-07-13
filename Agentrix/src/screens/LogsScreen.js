// src/screens/LogsScreen.js
import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, ScrollView, Alert, Share
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DeviceEventEmitter } from 'react-native';
import { LOG_EVENT_NAME } from '../services/LoggerService';
import { Couleurs } from '../styles/ThemeAgentrix';

const NATIVE_LOG_EVENT_NAME = 'MOMO_NATIVE_LOG';

export default function LogsScreen({ setAppState }) {
  const [logs, setLogs] = useState([]);
  const [autoScroll, setAutoScroll] = useState(true);
  const [filtre, setFiltre] = useState('TOUS');

  useEffect(() => {
    // Écouter les logs JS
    const subJs = DeviceEventEmitter.addListener(LOG_EVENT_NAME, (message) => {
      setLogs(prev => [...prev, { type: 'JS', message, timestamp: Date.now() }].slice(-500));
    });

    // Écouter les logs natifs
    const subNative = DeviceEventEmitter.addListener(NATIVE_LOG_EVENT_NAME, (message) => {
      setLogs(prev => [...prev, { type: 'NATIF', message, timestamp: Date.now() }].slice(-500));
    });

    return () => {
      if (subJs && subJs.remove) subJs.remove();
      if (subNative && subNative.remove) subNative.remove();
    };
  }, []);

  const logsFiltres = filtre === 'TOUS' 
    ? logs 
    : logs.filter(l => l.type === filtre);

  const getLogColor = (message) => {
    if (message.includes('✅') || message.includes('SUCCESS')) return '#10B981';
    if (message.includes('❌') || message.includes('ERROR')) return '#EF4444';
    if (message.includes('⚠️') || message.includes('WARN')) return '#F59E0B';
    if (message.includes('🔍') || message.includes('DEBUG')) return '#3B82F6';
    return '#6B7280';
  };

  const partagerLogs = async () => {
    try {
      const texte = logsFiltres.map(l => `[${l.type}] ${l.message}`).join('\n');
      await Share.share({ message: texte });
    } catch (e) {
      Alert.alert('Erreur', 'Impossible de partager les logs');
    }
  };

  const viderLogs = () => {
    Alert.alert(
      'Vider les logs ?',
      'Tous les logs seront supprimés.',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Vider', style: 'destructive', onPress: () => setLogs([]) }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setAppState?.('PILOTE1')}>
          <MaterialCommunityIcons name="arrow-left" size={28} color={Couleurs.texteNoir} />
        </TouchableOpacity>
        
        <Text style={styles.titre}>📋 Logs en temps réel</Text>
        
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={partagerLogs} style={styles.headerBtn}>
            <MaterialCommunityIcons name="share" size={24} color={Couleurs.vertAgentrix} />
          </TouchableOpacity>
          <TouchableOpacity onPress={viderLogs} style={styles.headerBtn}>
            <MaterialCommunityIcons name="delete" size={24} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>

      {/* FILTRES */}
      <View style={styles.filtresContainer}>
        {['TOUS', 'JS', 'NATIF'].map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filtreBtn, filtre === f && styles.filtreBtnActif]}
            onPress={() => setFiltre(f)}
          >
            <Text style={[styles.filtreTexte, filtre === f && styles.filtreTexteActif]}>
              {f} ({f === 'TOUS' ? logs.length : logs.filter(l => l.type === f).length})
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* LISTE DES LOGS */}
      <ScrollView 
        style={styles.logsContainer}
        ref={ref => this.scrollView = ref}
        onContentSizeChange={() => {
          if (autoScroll && this.scrollView) {
            this.scrollView.scrollToEnd({ animated: true });
          }
        }}
      >
        {logsFiltres.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="file-document-outline" size={64} color="#9CA3AF" />
            <Text style={styles.emptyText}>Aucun log pour le moment</Text>
            <Text style={styles.emptySubText}>
              Les logs apparaîtront ici en temps réel
            </Text>
          </View>
        ) : (
          logsFiltres.map((log, index) => (
            <View key={index} style={styles.logItem}>
              <View style={[styles.logTypeBadge, log.type === 'JS' ? styles.jsBadge : styles.natifBadge]}>
                <Text style={styles.logTypeText}>{log.type}</Text>
              </View>
              <Text style={[styles.logMessage, { color: getLogColor(log.message) }]}>
                {log.message}
              </Text>
            </View>
          ))
        )}
      </ScrollView>

      {/* FOOTER */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.autoScrollBtn}
          onPress={() => setAutoScroll(!autoScroll)}
        >
          <MaterialCommunityIcons 
            name={autoScroll ? "arrow-down-bold" : "arrow-down"} 
            size={20} 
            color={autoScroll ? Couleurs.vertAgentrix : '#9CA3AF'} 
          />
          <Text style={[styles.autoScrollText, autoScroll && styles.autoScrollTextActif]}>
            Auto-scroll
          </Text>
        </TouchableOpacity>
        
        <Text style={styles.compteur}>
          {logsFiltres.length} log{logsFiltres.length > 1 ? 's' : ''}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 15, backgroundColor: '#FFF',
    borderBottomWidth: 1, borderBottomColor: '#E5E7EB'
  },
  titre: { fontSize: 18, fontWeight: '700', color: '#111827' },
  headerActions: { flexDirection: 'row', gap: 15 },
  headerBtn: { padding: 5 },
  filtresContainer: { 
    flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 10,
    backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB'
  },
  filtreBtn: { 
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    backgroundColor: '#F3F4F6', marginRight: 8
  },
  filtreBtnActif: { backgroundColor: Couleurs.vertAgentrix },
  filtreTexte: { fontSize: 13, fontWeight: '600', color: '#6B7280' },
  filtreTexteActif: { color: '#FFF' },
  logsContainer: { flex: 1, paddingHorizontal: 15, paddingVertical: 10 },
  logItem: { 
    backgroundColor: '#FFF', borderRadius: 10, padding: 12, marginBottom: 8,
    borderWidth: 1, borderColor: '#E5E7EB'
  },
  logTypeBadge: { 
    alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 10, marginBottom: 6
  },
  jsBadge: { backgroundColor: '#DBEAFE' },
  natifBadge: { backgroundColor: '#FEF3C7' },
  logTypeText: { fontSize: 10, fontWeight: '700', color: '#374151' },
  logMessage: { fontSize: 13, fontFamily: 'monospace', lineHeight: 18 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 16, fontWeight: '600', color: '#6B7280', marginTop: 15 },
  emptySubText: { fontSize: 13, color: '#9CA3AF', marginTop: 5 },
  footer: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 12, backgroundColor: '#FFF',
    borderTopWidth: 1, borderTopColor: '#E5E7EB'
  },
  autoScrollBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  autoScrollText: { fontSize: 13, color: '#9CA3AF', fontWeight: '600' },
  autoScrollTextActif: { color: Couleurs.vertAgentrix },
  compteur: { fontSize: 13, color: '#6B7280', fontWeight: '600' }
});