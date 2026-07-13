// src/components/transfert/ModalConfirmation.js
import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Couleurs } from '../../styles/ThemeAgentrix';

export default function ModalConfirmation({ visible, onClose, onConfirm, operateur, numero, motif, montant }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <MaterialCommunityIcons name="send-circle" size={40} color={Couleurs.vertAgentrix} style={{ marginBottom: 16 }} />
          <Text style={styles.titre}>Confirmer la transaction</Text>
          <Ligne label="Operateur" valeur={operateur} />
          <Ligne label="Beneficiaire" valeur={numero} />
          {motif ? <Ligne label="Motif" valeur={motif} /> : null}
          <Ligne label="Montant" valeur={`${parseInt(montant || 0).toLocaleString()} FCFA`} couleur={Couleurs.vertAgentrix} />
          <View style={styles.actions}>
            <TouchableOpacity style={styles.btnAnnuler} onPress={onClose}>
              <Text style={styles.btnAnnulerTexte}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnConfirmer} onPress={onConfirm}>
              <Text style={styles.btnConfirmerTexte}>Confirmer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function Ligne({ label, valeur, couleur }) {
  return (
    <View style={styles.ligne}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.valeur, couleur && { color: couleur }]}>{valeur}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
  },
  titre: {
    fontSize: 18,
    fontWeight: '800',
    color: Couleurs.texteNoir,
    marginBottom: 20,
  },
  ligne: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  label: {
    fontSize: 13,
    color: Couleurs.texteGris,
  },
  valeur: {
    fontSize: 13,
    fontWeight: '700',
    color: Couleurs.texteNoir,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
    width: '100%',
  },
  btnAnnuler: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnAnnulerTexte: {
    color: Couleurs.texteGris,
    fontSize: 14,
    fontWeight: '700',
  },
  btnConfirmer: {
    flex: 1,
    backgroundColor: Couleurs.vertAgentrix,
    borderRadius: 12,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnConfirmerTexte: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
});