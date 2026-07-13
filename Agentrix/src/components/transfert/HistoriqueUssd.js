// components/transfert/HistoriqueUssd.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function HistoriqueUssd({ historique }) {
  if (!historique || historique.length === 0) return null;
  return (
    <View style={styles.card}>
      <Text style={styles.titre}>Historique des Sessions</Text>
      {historique.map(item => (
        <View key={item.id} style={styles.item}>
          <Text style={styles.code}>{item.code}</Text>
          <Text style={styles.reponse} numberOfLines={3}>{item.reponse}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#0d1117', borderRadius: 12, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: '#30363d' },
  titre: { color: '#58a6ff', fontSize: 12, fontWeight: '700', marginBottom: 12, textTransform: 'uppercase' },
  item: { borderBottomWidth: 1, borderBottomColor: '#21262d', paddingVertical: 10 },
  code: { color: '#f78166', fontSize: 12, fontWeight: '700', marginBottom: 4 },
  reponse: { color: '#8b949e', fontSize: 11, lineHeight: 16 },
});