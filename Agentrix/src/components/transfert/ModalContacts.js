// components/transfert/ModalContacts.js
import React from 'react';
import { View, Text, Modal, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Couleurs } from '../../styles/ThemeAgentrix';

export default function ModalContacts({ visible, onClose, numerosEnregistres, onSelect }) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.titre}>Numéros enregistrés</Text>
          <FlatList
            data={numerosEnregistres}
            keyExtractor={(item, index) => item.PhoneNumber || index.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.item} onPress={() => { onSelect(item.PhoneNumber); onClose(); }}>
                <MaterialCommunityIcons name="cellphone" size={20} color={Couleurs.vertAgentrix} />
                <Text style={styles.itemTexte}>{item.PhoneNumber}</Text>
                <Text style={styles.itemReseau}>{item.Reseau}</Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={<Text style={styles.vide}>Aucun numéro enregistré.</Text>}
          />
          <TouchableOpacity style={styles.btnFermer} onPress={onClose}>
            <Text style={styles.btnFermerTexte}>Fermer</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  card: { backgroundColor: '#FFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '50%' },
  titre: { fontSize: 18, fontWeight: '800', color: Couleurs.texteNoir, marginBottom: 15 },
  item: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  itemTexte: { flex: 1, fontSize: 16, fontWeight: '600', color: Couleurs.texteNoir, marginLeft: 12 },
  itemReseau: { fontSize: 12, color: Couleurs.texteGris },
  vide: { color: Couleurs.texteGris, textAlign: 'center', marginTop: 20 },
  btnFermer: { marginTop: 15, alignItems: 'center', paddingVertical: 12 },
  btnFermerTexte: { color: Couleurs.vertAgentrix, fontSize: 16, fontWeight: '700' },
});