// src/components/transfert/RecapTransfert.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Couleurs } from '../../styles/ThemeAgentrix';

export default function RecapTransfert({ montant }) {
  return (
    <View style={styles.card}>
      <View style={styles.ligne}>
        <Text style={styles.label}>Total :</Text>
        <Text style={styles.valeur}>
          {montant ? parseInt(montant).toLocaleString() : 0} FCFA
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    marginBottom: 25,
  },
  ligne: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: Couleurs.texteNoir,
  },
  valeur: {
    fontSize: 16,
    fontWeight: '800',
    color: Couleurs.vertAgentrix,
  },
});