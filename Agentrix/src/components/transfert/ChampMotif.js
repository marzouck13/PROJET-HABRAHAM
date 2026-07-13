// components/transfert/ChampNumero.js
import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Couleurs } from '../../styles/ThemeAgentrix';

export default function ChampNumero({ value, onChangeText, onPressContacts }) {
  return (
    <View style={styles.wrapper}>
      <MaterialCommunityIcons name="cellphone" size={20} color={Couleurs.texteGris} style={styles.icon} />
      <TextInput
        style={styles.input}
        placeholder="Ex: 61000000"
        keyboardType="phone-pad"
        value={value}
        onChangeText={onChangeText}
        maxLength={15}
      />
      <TouchableOpacity style={styles.btn} onPress={onPressContacts}>
        <MaterialCommunityIcons name="contacts-outline" size={22} color={Couleurs.vertAgentrix} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 12, height: 52 },
  icon: { marginRight: 10 },
  input: { flex: 1, fontSize: 16, fontWeight: '600', color: Couleurs.texteNoir, height: '100%' },
  btn: { padding: 6 },
});