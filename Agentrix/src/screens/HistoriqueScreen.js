// src/screens/HistoriqueScreen.js
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity,
  FlatList, RefreshControl
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StylesCommuns, Couleurs } from '../styles/ThemeAgentrix';
import { getHistoriqueTransactions } from '../services/NumberService';

export default function HistoriqueScreen({ setAppState }) {
  const [transactions, setTransactions] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filtreActif, setFiltreActif] = useState('TOUS');

  useEffect(() => {
    chargerHistorique();
  }, []);

  const chargerHistorique = async () => {
    try {
      const data = await getHistoriqueTransactions();
      setTransactions(data);
    } catch (error) {
      console.error('Erreur chargement historique:', error);
    } finally {
      setChargement(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await chargerHistorique();
    setRefreshing(false);
  };

  const transactionsFiltrees = filtreActif === 'TOUS' 
    ? transactions 
    : transactions.filter(t => t.Type === filtreActif);

  const formaterDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      day: '2-digit', 
      month: 'short',
      year: 'numeric'
    });
  };

  const formaterHeure = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  const getIconeType = (type) => {
    switch (type) {
      case 'DEPOT': return { nom: 'arrow-down-bold', couleur: '#10b981' };
      case 'RETRAIT': return { nom: 'arrow-up-bold', couleur: '#ef4444' };
      case 'COMMISSION': return { nom: 'cash', couleur: '#f59e0b' };
      case 'AJUSTEMENT': return { nom: 'tune', couleur: '#3b82f6' };
      default: return { nom: 'help-circle', couleur: '#6b7280' };
    }
  };

  const rendreItemTransaction = ({ item }) => {
    const icone = getIconeType(item.Type);
    const estPositif = item.Type === 'DEPOT' || item.Type === 'AJUSTEMENT';
    
    return (
      <View style={styles.carteTransaction}>
        <View style={styles.iconeConteneur}>
          <MaterialCommunityIcons name={icone.nom} size={24} color={icone.couleur} />
        </View>
        
        <View style={styles.infoConteneur}>
          <Text style={styles.typeTexte}>{item.Type}</Text>
          <Text style={styles.dateTexte}>
            {formaterDate(item.createdAt)} à {formaterHeure(item.createdAt)}
          </Text>
          <Text style={styles.reseauTexte}>{item.Reseau} • {item.Number?.PhoneNumber}</Text>
        </View>
        
        <View style={styles.montantConteneur}>
          <Text style={[
            styles.montantTexte, 
            { color: estPositif ? '#10b981' : '#ef4444' }
          ]}>
            {estPositif ? '+' : '-'}{parseFloat(item.Amount).toLocaleString()} FCFA
          </Text>
          <Text style={styles.soldeApresTexte}>
            Solde: {parseFloat(item.BalanceAfter).toLocaleString()} FCFA
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={StylesCommuns.conteneur}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setAppState?.('PILOTE1')}>
          <MaterialCommunityIcons name="arrow-left" size={28} color={Couleurs.texteNoir} />
        </TouchableOpacity>
        <Text style={styles.titre}>Historique des Transactions</Text>
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.filtresConteneur}>
        {['TOUS', 'DEPOT', 'RETRAIT', 'COMMISSION'].map((filtre) => (
          <TouchableOpacity
            key={filtre}
            style={[styles.filtreBouton, filtreActif === filtre && styles.filtreActif]}
            onPress={() => setFiltreActif(filtre)}
          >
            <Text style={[
              styles.filtreTexte,
              filtreActif === filtre && styles.filtreTexteActif
            ]}>
              {filtre}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {chargement ? (
        <View style={styles.chargementConteneur}>
          <Text style={styles.chargementTexte}>Chargement...</Text>
        </View>
      ) : transactionsFiltrees.length === 0 ? (
        <View style={styles.videConteneur}>
          <MaterialCommunityIcons name="clipboard-text-outline" size={64} color={Couleurs.texteGris} />
          <Text style={styles.videTexte}>Aucune transaction trouvée</Text>
        </View>
      ) : (
        <FlatList
          data={transactionsFiltrees}
          renderItem={rendreItemTransaction}
          keyExtractor={(item) => item.Id}
          contentContainerStyle={styles.listeConteneur}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}

      <TouchableOpacity 
        style={styles.btnRetour} 
        onPress={() => setAppState?.('PILOTE1')}
      >
        <MaterialCommunityIcons name="home" size={24} color={Couleurs.vertAgentrix} />
        <Text style={styles.btnRetourTexte}>Retour à l'accueil</Text>
      </TouchableOpacity>
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
  filtresConteneur: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 8,
  },
  filtreBouton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  filtreActif: {
    backgroundColor: Couleurs.vertAgentrix,
  },
  filtreTexte: {
    fontSize: 12,
    fontWeight: '600',
    color: Couleurs.texteGris,
  },
  filtreTexteActif: {
    color: '#FFF',
  },
  chargementConteneur: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  chargementTexte: {
    fontSize: 14,
    color: Couleurs.texteGris,
  },
  videConteneur: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  videTexte: {
    fontSize: 14,
    color: Couleurs.texteGris,
    marginTop: 12,
  },
  listeConteneur: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  carteTransaction: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  iconeConteneur: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoConteneur: {
    flex: 1,
  },
  typeTexte: {
    fontSize: 14,
    fontWeight: '700',
    color: Couleurs.texteNoir,
    marginBottom: 4,
  },
  dateTexte: {
    fontSize: 11,
    color: Couleurs.texteGris,
    marginBottom: 2,
  },
  reseauTexte: {
    fontSize: 11,
    color: Couleurs.texteGris,
  },
  montantConteneur: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  montantTexte: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 4,
  },
  soldeApresTexte: {
    fontSize: 10,
    color: Couleurs.texteGris,
  },
  btnRetour: {
    position: 'absolute',
    bottom: 30,
    left: 16,
    right: 16,
    backgroundColor: '#FFF',
    borderRadius: 12,
    height: 54,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Couleurs.vertAgentrix,
  },
  btnRetourTexte: {
    color: Couleurs.vertAgentrix,
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
});