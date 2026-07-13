// src/screens/ProfilScreen.js
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity,
  ScrollView, Alert
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StylesCommuns, Couleurs } from '../styles/ThemeAgentrix';

export default function ProfilScreen({ setAppState }) {
  const [donneesAgent] = useState({
    nom: "AFFO",
    prenom: "Marzouck",
    email: "marzouck.affo@agentrix.com",
    telephone: "+229 97 00 00 00",
    dateInscription: "15 Janvier 2024",
    statutVerification: "Vérifié"
  });

  const gererDeconnexion = () => {
    Alert.alert(
      "Déconnexion",
      "Êtes-vous sûr de vouloir vous déconnecter ?",
      [
        { text: "Annuler", style: "cancel" },
        { text: "Déconnexion", style: "destructive", onPress: () => {
          setAppState?.('CONNEXION');
        }}
      ]
    );
  };

  const MenuElement = ({ icone, label, onPress, couleur = Couleurs.texteNoir }) => (
    <TouchableOpacity style={styles.menuElement} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.menuGauche}>
        <MaterialCommunityIcons name={icone} size={22} color={couleur} />
        <Text style={[styles.menuLabel, { color: couleur }]}>{label}</Text>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={20} color={Couleurs.texteGris} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={StylesCommuns.conteneur}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setAppState?.('PILOTE1')}>
            <MaterialCommunityIcons name="arrow-left" size={28} color={Couleurs.texteNoir} />
          </TouchableOpacity>
          <Text style={styles.titre}>Mon Profil</Text>
          <View style={{ width: 28 }} />
        </View>

        <View style={styles.avatarSection}>
          <View style={styles.avatarConteneur}>
            <MaterialCommunityIcons name="account-circle" size={100} color={Couleurs.vertAgentrix} />
            <View style={styles.badgeVerification}>
              <MaterialCommunityIcons name="check-decagram" size={20} color="#FFF" />
            </View>
          </View>
          <Text style={styles.nomComplet}>{donneesAgent.prenom} {donneesAgent.nom}</Text>
          <View style={styles.badgeStatut}>
            <MaterialCommunityIcons name="shield-check" size={14} color={Couleurs.vertAgentrix} />
            <Text style={styles.badgeStatutTexte}>{donneesAgent.statutVerification}</Text>
          </View>
        </View>

        <View style={styles.infoCarte}>
          <Text style={styles.infoTitre}>Informations Personnelles</Text>
          
          <View style={styles.infoLigne}>
            <MaterialCommunityIcons name="email-outline" size={18} color={Couleurs.texteGris} />
            <View style={styles.infoTexteConteneur}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValeur}>{donneesAgent.email}</Text>
            </View>
          </View>

          <View style={styles.infoLigne}>
            <MaterialCommunityIcons name="cellphone" size={18} color={Couleurs.texteGris} />
            <View style={styles.infoTexteConteneur}>
              <Text style={styles.infoLabel}>Téléphone</Text>
              <Text style={styles.infoValeur}>{donneesAgent.telephone}</Text>
            </View>
          </View>

          <View style={styles.infoLigne}>
            <MaterialCommunityIcons name="calendar" size={18} color={Couleurs.texteGris} />
            <View style={styles.infoTexteConteneur}>
              <Text style={styles.infoLabel}>Membre depuis</Text>
              <Text style={styles.infoValeur}>{donneesAgent.dateInscription}</Text>
            </View>
          </View>
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.menuTitre}>Paramètres</Text>
          
          <MenuElement 
            icone="account-edit" 
            label="Modifier le profil"
            onPress={() => Alert.alert("Bientôt disponible", "Cette fonctionnalité sera disponible prochainement.")}
          />
          
          <MenuElement 
            icone="bell-outline" 
            label="Notifications"
            onPress={() => Alert.alert("Bientôt disponible", "Cette fonctionnalité sera disponible prochainement.")}
          />
          
          <MenuElement 
            icone="shield-lock-outline" 
            label="Sécurité et confidentialité"
            onPress={() => Alert.alert("Bientôt disponible", "Cette fonctionnalité sera disponible prochainement.")}
          />
          
          <MenuElement 
            icone="help-circle-outline" 
            label="Aide et support"
            onPress={() => Alert.alert("Bientôt disponible", "Cette fonctionnalité sera disponible prochainement.")}
          />
          
          <MenuElement 
            icone="information-outline" 
            label="À propos"
            onPress={() => Alert.alert("À propos", "Agentrix v1.0.0\nApplication de gestion mobile money")}
          />
        </View>

        <TouchableOpacity 
          style={styles.btnDeconnexion} 
          onPress={gererDeconnexion}
        >
          <MaterialCommunityIcons name="logout" size={22} color="#ef4444" />
          <Text style={styles.btnDeconnexionTexte}>Se déconnecter</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.btnRetour} 
          onPress={() => setAppState?.('PILOTE1')}
        >
          <MaterialCommunityIcons name="home" size={24} color={Couleurs.vertAgentrix} />
          <Text style={styles.btnRetourTexte}>Retour à l'accueil</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 20,
  },
  titre: {
    fontSize: 18,
    fontWeight: '700',
    color: Couleurs.texteNoir,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: '#FFF',
    marginBottom: 16,
  },
  avatarConteneur: {
    position: 'relative',
    marginBottom: 16,
  },
  badgeVerification: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Couleurs.vertAgentrix,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFF',
  },
  nomComplet: {
    fontSize: 22,
    fontWeight: '800',
    color: Couleurs.texteNoir,
    marginBottom: 8,
  },
  badgeStatut: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeStatutTexte: {
    fontSize: 12,
    fontWeight: '600',
    color: Couleurs.vertAgentrix,
    marginLeft: 4,
  },
  infoCarte: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  infoTitre: {
    fontSize: 16,
    fontWeight: '700',
    color: Couleurs.texteNoir,
    marginBottom: 16,
  },
  infoLigne: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoTexteConteneur: {
    marginLeft: 12,
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    color: Couleurs.texteGris,
    marginBottom: 2,
  },
  infoValeur: {
    fontSize: 14,
    fontWeight: '600',
    color: Couleurs.texteNoir,
  },
  menuSection: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  menuTitre: {
    fontSize: 16,
    fontWeight: '700',
    color: Couleurs.texteNoir,
    marginBottom: 12,
  },
  menuElement: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  menuGauche: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 12,
  },
  btnDeconnexion: {
    marginHorizontal: 16,
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    height: 54,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  btnDeconnexionTexte: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  btnRetour: {
    marginHorizontal: 16,
    backgroundColor: '#FFF',
    borderRadius: 12,
    height: 54,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Couleurs.vertAgentrix,
    marginBottom: 30,
  },
  btnRetourTexte: {
    color: Couleurs.vertAgentrix,
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
});