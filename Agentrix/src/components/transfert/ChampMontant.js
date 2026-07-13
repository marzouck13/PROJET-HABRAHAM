// src/components/transfert/ChampMontant.js
import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Couleurs } from '../../styles/ThemeAgentrix';

const MONTANTS_RAPIDES = [500, 1000, 2000, 5000, 10000, 25000];

export default function ChampMontant({ value, onChangeText, onSelectRapide }) {
  return (
    <View>
      <View style={styles.wrapper}>
        <MaterialCommunityIcons name="cash" size={20} color={Couleurs.texteGris} style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="0"
          keyboardType="numeric"
          value={value}
          onChangeText={onChangeText}
        />
        <Text style={styles.devise}>FCFA</Text>
      </View>
      <View style={styles.rapides}>
        {MONTANTS_RAPIDES.map(v => (
          <TouchableOpacity key={v} style={styles.puce} onPress={() => onSelectRapide(v)}>
            <Text style={styles.puceTexte}>+{v.toLocaleString()}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 52,
  },
  icon: { marginRight: 10 },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: Couleurs.texteNoir,
    height: '100%',
  },
  devise: {
    fontSize: 14,
    fontWeight: '700',
    color: Couleurs.texteGris,
  },
  rapides: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  puce: {
    backgroundColor: '#EeF9F3',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(12, 128, 62, 0.15)',
  },
  puceTexte: {
    color: Couleurs.vertAgentrix,
    fontSize: 12,
    fontWeight: '700',
  },
});