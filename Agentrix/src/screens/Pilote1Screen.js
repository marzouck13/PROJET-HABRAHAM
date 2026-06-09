import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  ScrollView,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StylesCommuns, Couleurs } from '../styles/ThemeAgentrix';

const { width } = Dimensions.get('window');

const Pilote1Screen = () => {
  // --- ÉTATS RÉELS ---
  const [chargement, setChargement] = useState(true);
  const [ongletActif, setOngletActif] = useState('ACCUEIL');
  const [donneesAgent, setDonneesAgent] = useState({
    nom: "AFFO",
    prenom: "Marzouck",
    solde: 2445000,
    notifications: 3
  });
  const [voirSolde, setVoirSolde] = useState(true);

  // --- LOGIQUE BACKEND ---
  useEffect(() => {
    recupererInfosTableauBord();
  }, []);

  const recupererInfosTableauBord = async () => {
    try {
      setChargement(true);
      // Appel API réel à venir ici
      // const res = await AuthService.getDashboardData();
      // setDonneesAgent(res);
      setChargement(false);
    } catch (error) {
      console.error("❌ [PILOTE1] Erreur fetch:", error);
      setChargement(false);
    }
  };

  // --- COMPOSANT INTERNE : BOUTON NAV ---
  const NavItem = ({ nom, icone, label }) => {
    const estActif = ongletActif === nom;
    return (
      <TouchableOpacity 
        style={styles.navItem} 
        onPress={() => setOngletActif(nom)}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons 
          name={estActif ? icone : `${icone}-outline`} 
          size={24} 
          color={estActif ? Couleurs.vertAgentrix : Couleurs.texteGris} 
        />
        <Text style={[styles.navLabel, { color: estActif ? Couleurs.vertAgentrix : Couleurs.texteGris }]}>
          {label}
        </Text>
        {estActif && <View style={styles.indicateurActif} />}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={StylesCommuns.conteneur}>
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{ paddingBottom: 100 }} // Espace pour la barre de nav
      >
        
        {/* --- HEADER SECTION --- */}
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <TouchableOpacity style={styles.avatarContainer}>
               <MaterialCommunityIcons name="account-circle" size={48} color={Couleurs.vertAgentrix} />
               <View style={styles.onlineBadge} />
            </TouchableOpacity>
            
            <View style={styles.textContainer}>
              <Text style={styles.salutation}>Salut cher Agent,</Text>
              <Text style={styles.userName}>{donneesAgent.prenom} {donneesAgent.nom} 👋</Text>
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

        {/* --- CARTE SOLDE (WALLET) --- */}
        <View style={styles.walletCard}>
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
              <Text style={styles.balanceText}>
                {voirSolde ? donneesAgent.solde.toLocaleString() : "••••••"} 
                <Text style={styles.currencyText}> FCFA</Text>
              </Text>
            )}
          </View>

          <TouchableOpacity 
            style={styles.toggleVisibility}
            onPress={() => setVoirSolde(!voirSolde)}
          >
            <MaterialCommunityIcons 
              name={voirSolde ? "eye-off-outline" : "eye-outline"} 
              size={18} 
              color={Couleurs.blancPur} 
              style={{ opacity: 0.8 }}
            />
            <Text style={styles.toggleText}>
              {voirSolde ? "Masquer le solde" : "Afficher le solde"}
            </Text>
          </TouchableOpacity>

          <View style={styles.walletIconBg}>
             <MaterialCommunityIcons name="wallet" size={80} color="rgba(255,255,255,0.15)" />
          </View>
        </View>

        {/* Les autres sections (Stats, Services) seront ajoutées ici */}

      </ScrollView>

      {/* --- BARRE DE NAVIGATION BASSE (FIXE) --- */}
      <View style={styles.bottomNav}>
        <NavItem nom="ACCUEIL" icone="home" label="Accueil" />
        <NavItem nom="HISTORIQUE" icone="clipboard-text" label="Activités" />
        
        {/* Bouton Central (Action rapide) */}
        <TouchableOpacity style={styles.centralBtn} activeOpacity={0.8}>
           <MaterialCommunityIcons name="plus" size={36} color={Couleurs.blancPur} />
        </TouchableOpacity>

        <NavItem nom="RESEAU" icone="account-group" label="Réseau" />
        <NavItem nom="PROFIL" icone="account" label="Profil" />
      </View>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 53,
    paddingBottom: 25,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#22c55edc',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  textContainer: {
    marginLeft: 12,
  },
  salutation: {
    fontSize: 13,
    color: Couleurs.texteGris,
    fontWeight: '500',
  },
  userName: {
    fontSize: 17,
    fontWeight: '700',
    color: Couleurs.texteNoir,
  },
  actionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notifDot: {
    position: 'absolute',
    top: 10,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Couleurs.erreur,
    borderWidth: 1,
    borderColor: '#FFF',
  },
  walletCard: {
    backgroundColor: '#0a6230df', 
    marginHorizontal: 10, 
    borderRadius: 14,
    padding: 20,
    height: 170,
    position: 'relative',
    overflow: 'hidden',
  },
  walletHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  walletLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
  },
  statsBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  balanceContainer: {
    marginTop: 10,
    height: 40,
    justifyContent: 'center',
  },
  balanceText: {
    color: Couleurs.blancPur,
    fontSize: 30,
    fontWeight: '800',
  },
  currencyText: {
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.8)',
  },
  toggleVisibility: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
  },
  toggleText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    marginLeft: 8,
    fontWeight: '500',
  },
  walletIconBg: {
    position: 'absolute',
    bottom: -3,
    right: -3,
  },
  // --- BOTTOM NAV STYLES ---
  bottomNav: {
    position: 'absolute',
    bottom: 29,
    left: 20,
    right: 20,
    height: 69,
    backgroundColor: '#FFF',
    borderRadius: 15,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    // Ombre pour le relief flat
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 9 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
    paddingHorizontal: 5,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  navLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 4,
  },
  indicateurActif: {
    position: 'absolute',
    bottom: -10,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Couleurs.vertAgentrix,
  },
  centralBtn: {
    width: 55,
    height: 55,
    borderRadius: 15,
    backgroundColor: Couleurs.vertAgentrix,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -35, // Effet flottant
    borderWidth: 5,
    borderColor: '#FFF',
  }
});

export default Pilote1Screen;