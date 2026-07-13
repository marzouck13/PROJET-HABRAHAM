// components/transfert/SelecteurReseau.js
import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Couleurs } from '../../styles/ThemeAgentrix';

const CONFIG_RESEAUX = {
  MTN:  { nom: 'MTN MoMo',     couleur: '#FFCC00', logo: require('../../../assets/images/mtn.png') },
  MOOV: { nom: 'Moov Money',   couleur: '#0062ad', logo: require('../../../assets/images/moov.png') },
  CELTIIS: { nom: 'Celtiis Cash', couleur: '#1a3a6e', logo: require('../../../assets/images/celtiis.png') },
};

export default function SelecteurReseau({ reseauxDisponibles, selectionne, onSelect }) {
  if (reseauxDisponibles.length === 0) {
    return <Text style={styles.texteAucun}>Aucun numéro enregistré.</Text>;
  }

  return (
    <View style={styles.grille}>
      {reseauxDisponibles.map(reseau => {
        const config = CONFIG_RESEAUX[reseau];
        if (!config) return null;
        const actif = selectionne === reseau;
        return (
          <TouchableOpacity
            key={reseau}
            style={[styles.carte, actif && { borderColor: config.couleur, backgroundColor: '#FFF' }]}
            onPress={() => onSelect(reseau)}
          >
            <View style={styles.logoConteneur}>
              <Image source={config.logo} style={styles.logoImage} resizeMode="contain" />
            </View>
            <Text style={[styles.nom, actif && styles.nomActif]}>{config.nom}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grille: { flexDirection: 'row', gap: 8 },
  carte: { flex: 1, backgroundColor: '#F3F4F6', borderWidth: 2, borderColor: 'transparent', borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  logoConteneur: { width: 36, height: 36, borderRadius: 8, overflow: 'hidden', backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center' },
  logoImage: { width: '100%', height: '100%' },
  nom: { fontSize: 11, fontWeight: '600', color: Couleurs.texteGris, marginTop: 6 },
  nomActif: { color: Couleurs.texteNoir, fontWeight: '700' },
  texteAucun: { color: Couleurs.texteGris, fontSize: 13, fontStyle: 'italic' },
}
)
;