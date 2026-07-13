// src/components/transfert/ReponseUssd.js
import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Platform } from 'react-native';

export default function ReponseUssd({ reponse, chargement }) {
  if (!reponse && !chargement) return null;

  return (
    <View style={styles.card}>
      <Text style={styles.titre}>Statut de l'Operation (In-App)</Text>
      {chargement ? (
        <ActivityIndicator size="small" color="#00ff88" style={{ alignSelf: 'flex-start', marginTop: 5 }} />
      ) : (
        <Text style={styles.texte}>{reponse}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  titre: {
    color: '#e94560',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  texte: {
    color: '#00ff88',
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    lineHeight: 22,
  },
});