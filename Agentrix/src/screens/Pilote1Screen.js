// src/screens/Pilote1Screen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity,
  ScrollView, ActivityIndicator, Dimensions, Image, RefreshControl
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StylesCommuns, Couleurs } from '../styles/ThemeAgentrix';
// ✅ Import corrigé depuis NumberService
import { getRegisteredNumbers, refreshBalance } from '../services/NumberService';

const { width } = Dimensions.get('window');

export default function Pilote1Screen({ setAppState }) {
  const [chargement, setChargement] = useState(true);
  const [ongletActif, setOngletActif] = useState('ACCUEIL');
  const [donneesAgent] = useState({
    nom: "AFFO",
    prenom: "Marzouck",
    notifications: 3
  });
  const [voirSolde, setVoirSolde] = useState(true);
  const [numeros, setNumeros] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  // ✅ Charge les numéros avec leurs soldes depuis la base
  const chargerNumeros = useCallback(async () => {
    setChargement(true);
    try {
      const nums = await getRegisteredNumbers();
      setNumeros(nums);
    } catch (error) {
      setNumeros([]);
    } finally {
      setChargement(false);
    }
  }, []);

  useEffect(() => { 
    chargerNumeros(); 
  }, [chargerNumeros]);

  // ✅ Rafraîchit les soldes (pull-to-refresh)
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    const updated = [];
    for (let num of numeros) {
      const result = await refreshBalance(num.Id);
      updated.push(result.success ? { ...num, Solde: result.solde } : num);
    }
    setNumeros(updated);
    setRefreshing(false);
  }, [numeros]);

  // ✅ Calcul du solde total (utilise la propriété Solde de chaque numéro)
  const soldeTotal = numeros.reduce((acc, n) => acc + (parseFloat(n.Solde) || 0), 0);

  const gererNavigation = (nom) => {
    setOngletActif(nom);
    
    if (!setAppState) {
      console.error('setAppState is undefined!');
      return;
    }
    
    switch (nom) {
      case 'ACCUEIL': 
        setAppState('PILOTE1'); 
        break;
      case 'HISTORIQUE': 
        setAppState('HISTORIQUE'); 
        break;
      case 'TRANSFERT': 
        setAppState('TRANSFERT'); 
        break;
      case 'FORFAIT': 
        setAppState('FORFAIT'); 
        break;
      case 'PROFIL': 
        setAppState('PROFIL'); 
        break;
      case 'AJOUTER': 
        setAppState('ADD_NUMBER'); 
        break;
    }
  };

  const NavItem = ({ nom, icone, label }) => {
    const estActif = ongletActif === nom;
    let nomIcone = estActif ? icone : `${icone}-outline`;
    if (!estActif && (icone === 'cash-fast' || icone === 'cellphone-wireless')) nomIcone = icone;
    
    return (
      <TouchableOpacity 
        style={styles.navItem} 
        onPress={() => gererNavigation(nom)} 
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons name={nomIcone} size={24} color={estActif ? Couleurs.vertAgentrix : Couleurs.texteGris} />
        <Text style={[styles.navLabel, { color: estActif ? Couleurs.vertAgentrix : Couleurs.texteGris }]}>{label}</Text>
        {estActif && <View style={styles.indicateurActif} />}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={StylesCommuns.conteneur}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 140 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <TouchableOpacity style={styles.avatarContainer}>
              <MaterialCommunityIcons name="account-circle" size={48} color={Couleurs.vertAgentrix} />
              <View style={styles.onlineBadge} />
            </TouchableOpacity>
            <View style={styles.textContainer}>
              <Text style={styles.salutation}>Salut cher Agent,</Text>
              <Text style={styles.userName}>{donneesAgent.prenom} {donneesAgent.nom}</Text>
            </View>
          </View>
          <View style={styles.actionGroup}>
            <TouchableOpacity style={styles.iconBtn}>
              <MaterialCommunityIcons name="bell-outline" size={24} color={Couleurs.texteNoir} />
              {donneesAgent.notifications > 0 && <View style={styles.notifDot} />}
            </TouchableOpacity>
            <TouchableOpacity style={[styles.iconBtn, { marginLeft: 10 }]}>
              <MaterialCommunityIcons name="menu" size={26} color={Couleurs.texteNoir} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.walletCard}>
          <View style={styles.cercleDeco1} />
          <View style={styles.cercleDeco2} />
          <View style={styles.cercleDeco3} />
          <View style={styles.walletHeader}>
            <Text style={styles.walletLabel}>SOLDE TOTAL</Text>
            <TouchableOpacity style={styles.statsBtn}>
              <MaterialCommunityIcons name="chart-bar" size={20} color={Couleurs.blancPur} />
            </TouchableOpacity>
          </View>
          <View style={styles.balanceContainer}>
            {chargement ? (
              <ActivityIndicator color={Couleurs.blancPur} />
            ) : (
              <Text style={styles.balanceText} numberOfLines={1} adjustsFontSizeToFit>
                {voirSolde ? soldeTotal.toLocaleString('fr-FR') : "••••••"}
                <Text style={styles.currencyText}> FCFA</Text>
              </Text>
            )}
          </View>
          <TouchableOpacity style={styles.toggleVisibility} onPress={() => setVoirSolde(!voirSolde)}>
            <MaterialCommunityIcons name={voirSolde ? "eye-off-outline" : "eye-outline"} size={18} color={Couleurs.blancPur} style={{ opacity: 0.8 }} />
            <Text style={styles.toggleText}>{voirSolde ? "Masquer le solde" : "Afficher le solde"}</Text>
          </TouchableOpacity>
          <View style={styles.walletIconBg}>
            <MaterialCommunityIcons name="wallet" size={80} color="rgba(255, 255, 255, 0.35)" />
          </View>
        </View>
<View style={styles.actionGroup}>
  <TouchableOpacity 
    style={styles.iconBtn}
    onPress={() => setAppState?.('DEBUG_BDD')}
  >
    <MaterialCommunityIcons name="bug" size={24} color="#EF4444" />
  </TouchableOpacity>
  <TouchableOpacity style={styles.iconBtn}>
    <MaterialCommunityIcons name="bell-outline" size={24} color={Couleurs.texteNoir} />
    {donneesAgent.notifications > 0 && <View style={styles.notifDot} />}
  </TouchableOpacity>
  <TouchableOpacity style={[styles.iconBtn, { marginLeft: 10 }]}>
    <MaterialCommunityIcons name="menu" size={26} color={Couleurs.texteNoir} />
  </TouchableOpacity>
</View>
// Dans Pilote1Screen.js, ajoutez dans le header :
<View style={styles.actionGroup}>
  {/* Bouton TEST MANUEL */}
  <TouchableOpacity 
    style={[styles.iconBtn, { backgroundColor: '#FEE2E2' }]}
    onPress={async () => {
      try {
        Logger.info('TEST', '🧪 DÉBUT TEST MANUEL');
        
        const { enregistrerNumero } = require('../services/NumberService');
        const db = require('../services/DatabaseService').default;
        
        Logger.info('TEST', '📊 Stats avant test:');
        const stats1 = await db.getStats();
        Logger.info('TEST', JSON.stringify(stats1));
        
        Logger.info('TEST', '📞 Tentative enregistrement test...');
        const result = await enregistrerNumero(
          '99999999',
          'MTN',
          12345,
          null
        );
        
        Logger.info('TEST', `📊 Résultat: ${JSON.stringify(result)}`);
        
        Logger.info('TEST', '📊 Stats après test:');
        const stats2 = await db.getStats();
        Logger.info('TEST', JSON.stringify(stats2));
        
        Alert.alert(
          'Test Terminé',
          `Avant: ${stats1.numbers} numéros, ${stats1.solds} soldes\n` +
          `Après: ${stats2.numbers} numéros, ${stats2.solds} soldes\n` +
          `Résultat: ${result.success ? '✅ SUCCÈS' : '❌ ÉCHEC'}\n` +
          `Message: ${result.message}`,
          [{ text: 'OK' }]
        );
      } catch (error) {
        Logger.error('TEST', `❌ Erreur: ${error.message}`);
        Alert.alert('Erreur', error.message);
      }
    }}
  >
    <MaterialCommunityIcons name="test-tube" size={24} color="#DC2626" />
  </TouchableOpacity>
  
  {/* Bouton DEBUG BDD */}
  <TouchableOpacity 
    style={styles.iconBtn}
    onPress={() => setAppState?.('DEBUG_BDD')}
  >
    <MaterialCommunityIcons name="bug" size={24} color="#EF4444" />
  </TouchableOpacity>
  
  <TouchableOpacity style={styles.iconBtn}>
    <MaterialCommunityIcons name="bell-outline" size={24} color={Couleurs.texteNoir} />
    {donneesAgent.notifications > 0 && <View style={styles.notifDot} />}
  </TouchableOpacity>
  <TouchableOpacity style={[styles.iconBtn, { marginLeft: 10 }]}>
    <MaterialCommunityIcons name="menu" size={26} color={Couleurs.texteNoir} />
  </TouchableOpacity>
</View>
        <View style={styles.sectionOperateurs}>
          <Text style={styles.titreSection}>Mes Comptes Operateurs</Text>
          {numeros.length === 0 ? (
            <Text style={styles.aucun}>Aucun numero enregistre. Appuyez sur "+" pour ajouter.</Text>
          ) : (
            numeros.map((num) => {
              const op = num.Reseau;
              const logo = op === 'MTN' ? require('../../assets/images/mtn.png') :
                          op === 'MOOV' ? require('../../assets/images/moov.png') :
                          require('../../assets/images/celtiis.png');
              return (
                // ✅ Utilise num.Id (UUID) comme key au lieu de num.id
                <View key={num.Id} style={styles.carteOperateur}>
                  <View style={styles.opHeaderRow}>
                    <View style={styles.logoConteneur}>
                      <Image source={logo} style={styles.logoOperateur} resizeMode="contain" />
                    </View>
                    <View>
                      <Text style={styles.opLabelTexte}>{num.PhoneNumber}</Text>
                      <Text style={styles.opReseau}>{op}</Text>
                    </View>
                  </View>
                  <View style={styles.opSoldeRow}>
                    <Text style={styles.opSoldeTexte}>
                      {voirSolde ? (parseFloat(num.Solde) || 0).toLocaleString('fr-FR') : "........."}
                      <Text style={styles.opDeviseTexte}> FCFA</Text>
                    </Text>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      <View style={styles.bottomNav}>
        <NavItem nom="ACCUEIL" icone="home" label="Accueil" />
        <NavItem nom="HISTORIQUE" icone="clipboard-text" label="Historique" />
        <NavItem nom="TRANSFERT" icone="cash-fast" label="Transfert" />
        <NavItem nom="FORFAIT" icone="cellphone-wireless" label="Forfait" />
        <NavItem nom="PROFIL" icone="account" label="Profil" />
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={() => gererNavigation('AJOUTER')}
        >
          <MaterialCommunityIcons name="plus" size={28} color="#FFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 12, paddingTop: 53, paddingBottom: 25,
  },
  userInfo: { flexDirection: 'row', alignItems: 'center' },
  avatarContainer: { position: 'relative' },
  onlineBadge: {
    position: 'absolute', bottom: 2, right: 2,
    width: 12, height: 12, borderRadius: 6,
    backgroundColor: '#22c55edc', borderWidth: 2, borderColor: '#FFF',
  },
  textContainer: { marginLeft: 12 },
  salutation: { fontSize: 13, color: Couleurs.texteGris, fontWeight: '500' },
  userName: { fontSize: 17, fontWeight: '700', color: Couleurs.texteNoir },
  actionGroup: { flexDirection: 'row', alignItems: 'center' },
  iconBtn: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center', position: 'relative',
  },
  notifDot: {
    position: 'absolute', top: 10, right: 12,
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: Couleurs.erreur, borderWidth: 1, borderColor: '#FFF',
  },
  walletCard: {
    backgroundColor: '#0c803ef7', marginHorizontal: 10, borderRadius: 14,
    padding: 20, height: 170, position: 'relative', overflow: 'hidden',
  },
  walletHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  walletLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '600', letterSpacing: 1 },
  statsBtn: { width: 32, height: 32, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
  balanceContainer: { marginTop: 10, height: 40, justifyContent: 'center' },
  balanceText: { color: Couleurs.blancPur, fontSize: 30, fontWeight: '800' },
  currencyText: { fontSize: 16, fontWeight: '500', color: 'rgba(255,255,255,0.8)' },
  toggleVisibility: { flexDirection: 'row', alignItems: 'center', marginTop: 15 },
  toggleText: { color: 'rgba(255,255,255,0.7)', fontSize: 13, marginLeft: 8, fontWeight: '500' },
  walletIconBg: { position: 'absolute', bottom: -3, right: -3 },
  sectionOperateurs: { marginTop: 30, paddingHorizontal: 12 },
  titreSection: { fontSize: 15, fontWeight: '700', color: Couleurs.texteNoir, marginBottom: 12 },
  carteOperateur: {
    backgroundColor: '#ffffff', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    shadowColor: '#0000008f', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 5, marginBottom: 10,
  },
  opHeaderRow: { flexDirection: 'row', alignItems: 'center' },
  logoConteneur: { width: 45, height: 45, borderRadius: 10, backgroundColor: '#f9fafb62', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  logoOperateur: { width: '100%', height: '100%' },
  opLabelTexte: { marginLeft: 12, fontSize: 14, fontWeight: '600', color: '#374151' },
  opReseau: { marginLeft: 12, fontSize: 11, color: Couleurs.texteGris },
  opSoldeRow: { alignItems: 'flex-end' },
  opSoldeTexte: { fontSize: 15, fontWeight: '700', color: Couleurs.texteNoir },
  opDeviseTexte: { fontSize: 11, fontWeight: '500', color: Couleurs.texteGris },
  bottomNav: {
    position: 'absolute', 
    bottom: 20, 
    left: 10, 
    right: 10,
    height: 69, 
    backgroundColor: '#FFF', 
    borderRadius: 15,
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    alignItems: 'center',
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 9 },
    shadowOpacity: 0.1, 
    shadowRadius: 20, 
    elevation: 8,
    paddingHorizontal: 2,
    zIndex: 1000,
  },
  navItem: { 
    alignItems: 'center', 
    justifyContent: 'center', 
    flex: 1,
    paddingVertical: 8,
  },
  navLabel: { fontSize: 10, fontWeight: '600', marginTop: 4 },
  indicateurActif: { position: 'absolute', bottom: 2, width: 4, height: 4, borderRadius: 2, backgroundColor: Couleurs.vertAgentrix },
  addButton: {
    backgroundColor: Couleurs.vertAgentrix, 
    width: 50, 
    height: 50,
    borderRadius: 25, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginLeft: 5,
  },
  aucun: { color: Couleurs.texteGris, fontSize: 13, fontStyle: 'italic', marginTop: 10 },
  cercleDeco1: { position: 'absolute', top: -30, right: -30, width: 102, height: 102, borderRadius: 50, backgroundColor: 'rgba(255, 255, 255, 0.13)', zIndex: 0 },
  cercleDeco2: { position: 'absolute', bottom: -20, left: -20, width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255, 255, 255, 0.14)', zIndex: 0 },
  cercleDeco3: { position: 'absolute', top: '9%', left: 95, width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(218, 217, 217, 0.14)', zIndex: 0 },
});