import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  TextInput, 
  ScrollView, 
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StylesCommuns, Couleurs } from '../styles/ThemeAgentrix';

const ForfaitScreen = ({ setAppState }) => {
  // --- ETATS ---
  const [operateurSelectionne, setOperateurSelectionne] = useState('mtn');
  const [categorieSelectionnee, setCategorieSelectionnee] = useState('INTERNET');
  const [numeroTelephone, setNumeroTelephone] = useState('');
  const [forfaitSelectionne, setForfaitSelectionne] = useState(null);

  // Liste des operateurs actifs
  const listeOperateurs = [
    { id: 'mtn', nom: 'MTN MoMo', couleur: '#FFCC00', logo: require('../../assets/images/mtn.png') },
    { id: 'moov', nom: 'Moov Money', couleur: '#0062ad', logo: require('../../assets/images/moov.png') },
    { id: 'celtiis', nom: 'Celtiis Cash', couleur: '#1a3a6e', logo: require('../../assets/images/celtiis.png') },
  ];

  // Liste des categories de forfaits
  const listeCategories = [
    { id: 'INTERNET', label: 'Internet', icone: 'web' },
    { id: 'APPEL', label: 'Appels', icone: 'phone' },
    { id: 'MIXTE', label: 'Mixte', icone: 'star' }
  ];

  // Base de donnees fictive des forfaits
  const catalogueForfaits = [
    // MTN
  // Catalogue complet MTN Benin

    // INTERNET - Forfaits Jour
    { id: 'mtn_int_jour_1', operateur: 'mtn', categorie: 'INTERNET', nom: 'Internet Flash', volume: '40 Mo', validite: '24 Heures', prix: 100 },
    { id: 'mtn_int_jour_2', operateur: 'mtn', categorie: 'INTERNET', nom: 'Internet Boost', volume: '100 Mo', validite: '24 Heures', prix: 150 },
    { id: 'mtn_int_jour_3', operateur: 'mtn', categorie: 'INTERNET', nom: 'Internet Plus', volume: '150 Mo', validite: '24 Heures', prix: 200 },
    { id: 'mtn_int_jour_4', operateur: 'mtn', categorie: 'INTERNET', nom: 'Internet Max', volume: '200 Mo', validite: '24 Heures', prix: 250 },
    { id: 'mtn_int_jour_5', operateur: 'mtn', categorie: 'INTERNET', nom: 'Internet Premium', volume: '250 Mo', validite: '24 Heures', prix: 300 },
    
    // INTERNET - Forfaits Maxi
    { id: 'mtn_int_sem_1', operateur: 'mtn', categorie: 'INTERNET', nom: 'Maxi Hebdo Mini', volume: '500 Mo + Appels', validite: '7 Jours', prix: 1000 },
    { id: 'mtn_int_sem_2', operateur: 'mtn', categorie: 'INTERNET', nom: 'Maxi Hebdo Plus', volume: '1.5 Go + Appels', validite: '7 Jours', prix: 1500 },
    { id: 'mtn_int_sem_3', operateur: 'mtn', categorie: 'INTERNET', nom: 'Maxi Hebdo Max', volume: '2 Go + Appels', validite: '7 Jours', prix: 2000 },
    { id: 'mtn_int_mois_1', operateur: 'mtn', categorie: 'INTERNET', nom: 'Maxi Mensuel Plus', volume: '3 Go + Appels', validite: '30 Jours', prix: 2500 },
    { id: 'mtn_int_mois_2', operateur: 'mtn', categorie: 'INTERNET', nom: 'Maxi Mensuel Premium', volume: '6 Go + Appels', validite: '30 Jours', prix: 5000 },
    
    // INTERNET - Forfaits Volumes
    { id: 'mtn_int_vol_1', operateur: 'mtn', categorie: 'INTERNET', nom: 'Volume 25 Go', volume: '25 Go', validite: '30 Jours', prix: 15500 },
    { id: 'mtn_int_vol_2', operateur: 'mtn', categorie: 'INTERNET', nom: 'Volume 50 Go', volume: '50 Go', validite: '30 Jours', prix: 20000 },
    { id: 'mtn_int_vol_3', operateur: 'mtn', categorie: 'INTERNET', nom: 'Volume 80 Go', volume: '80 Go', validite: '30 Jours', prix: 25000 },
    { id: 'mtn_int_vol_4', operateur: 'mtn', categorie: 'INTERNET', nom: 'Volume 100 Go', volume: '100 Go', validite: '30 Jours', prix: 30000 },
    
    // INTERNET - Forfaits Pro Illimites
    { id: 'mtn_int_pro_1', operateur: 'mtn', categorie: 'INTERNET', nom: 'Internet Pro Bronze', volume: '75 Go + Illimite', validite: '30 Jours', prix: 25000 },
    { id: 'mtn_int_pro_2', operateur: 'mtn', categorie: 'INTERNET', nom: 'Internet Pro Silver', volume: '90 Go + Illimite', validite: '30 Jours', prix: 30000 },
    { id: 'mtn_int_pro_3', operateur: 'mtn', categorie: 'INTERNET', nom: 'Internet Pro Gold', volume: '150 Go + Illimite', validite: '30 Jours', prix: 50000 },
    { id: 'mtn_int_pro_4', operateur: 'mtn', categorie: 'INTERNET', nom: 'Internet Pro Platinum', volume: '260 Go + Illimite', validite: '30 Jours', prix: 75000 },
    { id: 'mtn_int_pro_5', operateur: 'mtn', categorie: 'INTERNET', nom: 'Internet Pro Diamond', volume: '350 Go + Illimite', validite: '30 Jours', prix: 100000 },
    { id: 'mtn_int_pro_6', operateur: 'mtn', categorie: 'INTERNET', nom: 'Internet Pro Premium', volume: '450 Go + Illimite', validite: '30 Jours', prix: 125000 },
    
    // APPELS - Forfaits Maxi
    { id: 'mtn_app_jour_1', operateur: 'mtn', categorie: 'APPEL', nom: 'Maxi Jour Mini', volume: 'Tarif 0.94 F/s', validite: '24 Heures', prix: 100 },
    { id: 'mtn_app_jour_2', operateur: 'mtn', categorie: 'APPEL', nom: 'Maxi Jour Plus', volume: 'Tarif 0.94 F/s', validite: '24 Heures', prix: 150 },
    { id: 'mtn_app_jour_3', operateur: 'mtn', categorie: 'APPEL', nom: 'Maxi Jour Premium', volume: 'Tarif 0.85 F/s', validite: '24 Heures', prix: 500 },
    { id: 'mtn_app_sem_1', operateur: 'mtn', categorie: 'APPEL', nom: 'Maxi Hebdo', volume: 'Tarif 0.75 F/s', validite: '7 Jours', prix: 1000 },
    { id: 'mtn_app_mois_1', operateur: 'mtn', categorie: 'APPEL', nom: 'Maxi Mensuel', volume: 'Tarif 0.65 F/s', validite: '30 Jours', prix: 2500 },
    
    // MIXTE - Go Pack
    { id: 'mtn_mix_jour_1', operateur: 'mtn', categorie: 'MIXTE', nom: 'Go Pack Mini', volume: '3 min + 3 Mo + 3 SMS', validite: '24 Heures', prix: 100 },
    { id: 'mtn_mix_jour_2', operateur: 'mtn', categorie: 'MIXTE', nom: 'Go Pack Standard', volume: '7 min + 7 Mo + 7 SMS', validite: '24 Heures', prix: 200 },
    { id: 'mtn_mix_jour_3', operateur: 'mtn', categorie: 'MIXTE', nom: 'Go Pack Plus', volume: '11 min + 11 Mo + 11 SMS', validite: '24 Heures', prix: 300 },
    { id: 'mtn_mix_jour_4', operateur: 'mtn', categorie: 'MIXTE', nom: 'Go Pack Max', volume: '19 min + 19 Mo', validite: '24 Heures', prix: 500 },
    { id: 'mtn_mix_sem_1', operateur: 'mtn', categorie: 'MIXTE', nom: 'Go Pack Hebdo', volume: '35 min + 35 Mo', validite: '7 Jours', prix: 1000 },
    { id: 'mtn_mix_sem_2', operateur: 'mtn', categorie: 'MIXTE', nom: 'Go Pack Hebdo Plus', volume: '60 min + 60 Mo', validite: '7 Jours', prix: 1500 },
    { id: 'mtn_mix_mois_1', operateur: 'mtn', categorie: 'MIXTE', nom: 'Go Pack 20 Jours', volume: '80 min + 80 Mo + 80 SMS', validite: '20 Jours', prix: 2500 },
    { id: 'mtn_mix_mois_2', operateur: 'mtn', categorie: 'MIXTE', nom: 'Go Pack Mensuel', volume: '175 min + 175 Mo + 175 SMS', validite: '30 Jours', prix: 5000 },
    
  // Catalogue complet MOOV Africa Bénin

    // INTERNET - Forfaits Jour
    { id: 'moov_int_jour_1', operateur: 'moov', categorie: 'INTERNET', nom: 'Internet Flash', volume: '100 Mo', validite: '24 Heures', prix: 100 },
    { id: 'moov_int_jour_2', operateur: 'moov', categorie: 'INTERNET', nom: 'Internet Boost', volume: '150 Mo', validite: '24 Heures', prix: 150 },
    { id: 'moov_int_jour_3', operateur: 'moov', categorie: 'INTERNET', nom: 'Internet Plus', volume: '200 Mo', validite: '24 Heures', prix: 200 },
    { id: 'moov_int_jour_4', operateur: 'moov', categorie: 'INTERNET', nom: 'Internet Max', volume: '250 Mo', validite: '24 Heures', prix: 250 },
    { id: 'moov_int_jour_5', operateur: 'moov', categorie: 'INTERNET', nom: 'Internet Premium', volume: '300 Mo', validite: '24 Heures', prix: 300 },
    
    // INTERNET - Forfaits 3 jours
    { id: 'moov_int_3j_1', operateur: 'moov', categorie: 'INTERNET', nom: 'Internet 3J Plus', volume: '500 Mo', validite: '3 Jours', prix: 500 },
    { id: 'moov_int_3j_2', operateur: 'moov', categorie: 'INTERNET', nom: 'Internet 3J Max', volume: '560 Mo', validite: '3 Jours', prix: 550 },
    { id: 'moov_int_3j_3', operateur: 'moov', categorie: 'INTERNET', nom: 'Internet 3J Premium', volume: '770 Mo', validite: '3 Jours', prix: 750 },
    
    // INTERNET - Forfaits Hebdomadaires
    { id: 'moov_int_hebdo_1', operateur: 'moov', categorie: 'INTERNET', nom: 'Internet 5J', volume: '300 Mo', validite: '5 Jours', prix: 500 },
    { id: 'moov_int_hebdo_2', operateur: 'moov', categorie: 'INTERNET', nom: 'Internet 7J', volume: '700 Mo', validite: '7 Jours', prix: 1000 },
    { id: 'moov_int_hebdo_3', operateur: 'moov', categorie: 'INTERNET', nom: 'Internet 15J Mini', volume: '650 Mo', validite: '15 Jours', prix: 1000 },
    { id: 'moov_int_hebdo_4', operateur: 'moov', categorie: 'INTERNET', nom: 'Internet 15J Plus', volume: '1.5 Go', validite: '15 Jours', prix: 2000 },
    { id: 'moov_int_hebdo_5', operateur: 'moov', categorie: 'INTERNET', nom: 'Internet 20J', volume: '2.5 Go', validite: '20 Jours', prix: 2500 },
    { id: 'moov_int_hebdo_6', operateur: 'moov', categorie: 'INTERNET', nom: 'Internet 20J Plus', volume: '3.5 Go', validite: '20 Jours', prix: 4000 },
    
    // INTERNET - Forfaits Mensuels
    { id: 'moov_int_mois_1', operateur: 'moov', categorie: 'INTERNET', nom: 'Internet Mensuel 5 Go', volume: '5 Go', validite: '30 Jours', prix: 5000 },
    { id: 'moov_int_mois_2', operateur: 'moov', categorie: 'INTERNET', nom: 'Internet Mensuel 6 Go', volume: '6 Go', validite: '30 Jours', prix: 6000 },
    { id: 'moov_int_mois_3', operateur: 'moov', categorie: 'INTERNET', nom: 'Internet Mensuel 10 Go', volume: '10 Go', validite: '30 Jours', prix: 10000 },
    { id: 'moov_int_mois_4', operateur: 'moov', categorie: 'INTERNET', nom: 'Internet Mensuel 15 Go', volume: '15 Go', validite: '30 Jours', prix: 15000 },
    
    // INTERNET - Forfaits Illimites
    { id: 'moov_int_illim_1', operateur: 'moov', categorie: 'INTERNET', nom: 'Illimite 25 Go', volume: '25 Go + Illimite', validite: '30 Jours', prix: 15100 },
    { id: 'moov_int_illim_2', operateur: 'moov', categorie: 'INTERNET', nom: 'Illimite 40 Go', volume: '40 Go + Illimite', validite: '30 Jours', prix: 15500 },
    { id: 'moov_int_illim_3', operateur: 'moov', categorie: 'INTERNET', nom: 'Illimite 60 Go', volume: '60 Go + Illimite', validite: '30 Jours', prix: 20000 },
    { id: 'moov_int_illim_4', operateur: 'moov', categorie: 'INTERNET', nom: 'Illimite 95 Go', volume: '95 Go + Illimite', validite: '30 Jours', prix: 25000 },
    { id: 'moov_int_illim_5', operateur: 'moov', categorie: 'INTERNET', nom: 'Illimite 130 Go', volume: '130 Go + Illimite', validite: '30 Jours', prix: 30000 },
    { id: 'moov_int_illim_6', operateur: 'moov', categorie: 'INTERNET', nom: 'Illimite 500 Go', volume: '500 Go + Illimite', validite: '30 Jours', prix: 50000 },
    { id: 'moov_int_illim_7', operateur: 'moov', categorie: 'INTERNET', nom: 'Illimite 750 Go', volume: '750 Go + Illimite', validite: '30 Jours', prix: 75000 },
    { id: 'moov_int_illim_8', operateur: 'moov', categorie: 'INTERNET', nom: 'Illimite 1 To', volume: '1 To + Illimite', validite: '30 Jours', prix: 100000 },
    { id: 'moov_int_illim_9', operateur: 'moov', categorie: 'INTERNET', nom: 'Illimite 2 To', volume: '2 To + Illimite', validite: '30 Jours', prix: 125000 },
    
    // APPELS - Forfaits Sayaa
    { id: 'moov_app_jour_1', operateur: 'moov', categorie: 'APPEL', nom: 'Sayaa Jour', volume: '12 min', validite: '24 Heures', prix: 300 },
    { id: 'moov_app_sem_1', operateur: 'moov', categorie: 'APPEL', nom: 'Sayaa Hebdo', volume: '41 min', validite: '7 Jours', prix: 1000 },
    { id: 'moov_app_sem_2', operateur: 'moov', categorie: 'APPEL', nom: 'Sayaa Hebdo Plus', volume: '62 min', validite: '7 Jours', prix: 1500 },
    
    // MIXTE - Forfaits Voix
    { id: 'moov_mix_jour_1', operateur: 'moov', categorie: 'MIXTE', nom: 'Mixte 100', volume: '3 min + 3 Mo + 3 SMS', validite: '24 Heures', prix: 100 },
    { id: 'moov_mix_jour_2', operateur: 'moov', categorie: 'MIXTE', nom: 'Mixte 150', volume: '5 min + 5 Mo + 5 SMS', validite: '24 Heures', prix: 150 },
    { id: 'moov_mix_jour_3', operateur: 'moov', categorie: 'MIXTE', nom: 'Mixte 200', volume: '7 min + 7 Mo + 7 SMS', validite: '24 Heures', prix: 200 },
    { id: 'moov_mix_jour_4', operateur: 'moov', categorie: 'MIXTE', nom: 'Mixte 300', volume: '11 min + 11 Mo + 11 SMS', validite: '24 Heures', prix: 300 },
    { id: 'moov_mix_3j_1', operateur: 'moov', categorie: 'MIXTE', nom: 'Mixte 500', volume: '19 min + 19 Mo', validite: '72 Heures', prix: 500 },
    { id: 'moov_mix_3j_2', operateur: 'moov', categorie: 'MIXTE', nom: 'Mixte 750', volume: '28 min + 28 Mo', validite: '72 Heures', prix: 750 },
    { id: 'moov_mix_mois_1', operateur: 'moov', categorie: 'MIXTE', nom: 'Voix 1000', volume: '35 min + 35 Mo', validite: '30 Jours', prix: 1000 },
    { id: 'moov_mix_mois_2', operateur: 'moov', categorie: 'MIXTE', nom: 'Voix 2500', volume: '80 min + 80 Mo', validite: '30 Jours', prix: 2500 },
    { id: 'moov_mix_mois_3', operateur: 'moov', categorie: 'MIXTE', nom: 'Voix 5000', volume: '175 min + 175 Mo', validite: '30 Jours', prix: 5000 },
    { id: 'moov_mix_premium_1', operateur: 'moov', categorie: 'MIXTE', nom: 'Formule Classique', volume: '60 min + 50 Mo + 100 SMS', validite: '30 Jours', prix: 5000 },
    { id: 'moov_mix_premium_2', operateur: 'moov', categorie: 'MIXTE', nom: 'Formule Plus', volume: '300 min + 500 Mo + 500 SMS', validite: '30 Jours', prix: 15000 },
    { id: 'moov_mix_premium_3', operateur: 'moov', categorie: 'MIXTE', nom: 'Formule Premium', volume: '600 min + 1.5 Go + 500 SMS', validite: '30 Jours', prix: 25000 },

    // CELTIIS
    { id: 'celtiis_int_1', operateur: 'celtiis', categorie: 'INTERNET', nom: 'Allo Net 200', volume: '1 Go', validite: '24 Heures', prix: 200 },
    { id: 'celtiis_mix_1', operateur: 'celtiis', categorie: 'MIXTE', nom: 'Top Chrono', volume: '2 Go + 60 Min', validite: '7 Jours', prix: 1200 },
  ];

  // Filtrer les forfaits
  const forfaitsFiltres = catalogueForfaits.filter(
    (f) => f.operateur === operateurSelectionne && f.categorie === categorieSelectionnee
  );

  // --- LOGIQUE METIER ---
  const validerVenteForfait = () => {
    if (!numeroTelephone || numeroTelephone.trim().length !== 10) {
      Alert.alert("Erreur", "Veuillez saisir un numero de telephone valide a 10 chiffres.");
      return;
    }
    if (!forfaitSelectionne) {
      Alert.alert("Erreur", "Veuillez selectionner un forfait dans la liste.");
      return;
    }

    const opNom = listeOperateurs.find(op => op.id === operateurSelectionne)?.nom;

    Alert.alert(
      "Confirmer l'activation",
      `Vous allez activer le forfait suivant :\n\n- Forfait : ${forfaitSelectionne.nom} (${forfaitSelectionne.volume})\n- Prix : ${forfaitSelectionne.prix.toLocaleString()} FCFA\n- Beneficiaire : ${numeroTelephone}\n- Reseau : ${opNom}\n\nSouhaitez-vous continuer ?`,
      [
        { text: "Annuler", style: "cancel" },
        { text: "Confirmer", onPress: () => executerVente() }
      ]
    );
  };

  const executerVente = () => {
    Alert.alert("Succes", "Le forfait a ete active avec succes sur le numero du client !");
    setNumeroTelephone('');
    setForfaitSelectionne(null);
  };

  const retourAccueil = () => {
    if (setAppState) {
      setAppState('PILOTE1');
    }
  };

  return (
    <SafeAreaView style={StylesCommuns.conteneur}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
      >
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContainer}
        >
          {/* --- HEADER DE LA PAGE --- */}
          <View style={styles.headerPage}>
            <Text style={styles.titrePage}>Achat de Forfait</Text>
            <Text style={styles.sousTitrePage}>Activez des forfaits internet ou appels pour vos clients.</Text>
          </View>

          {/* --- ETAPE 1 : CHOIX DE L'OPERATEUR --- */}
          <View style={styles.sectionFormulaire}>
            <Text style={styles.labelSection}>1. Choisissez l'operateur</Text>
            <View style={styles.grilleOperateurs}>
              {listeOperateurs.map((op) => {
                const estSelectionne = operateurSelectionne === op.id;
                return (
                  <TouchableOpacity
                    key={op.id}
                    style={[
                      styles.carteChoixOp,
                      estSelectionne && { borderColor: op.couleur, backgroundColor: '#FFF' }
                    ]}
                    onPress={() => {
                      setOperateurSelectionne(op.id);
                      setForfaitSelectionne(null);
                    }}
                    activeOpacity={0.8}
                  >
                    <View style={styles.logoConteneur}>
                      <Image source={op.logo} style={styles.logoImage} resizeMode="contain" />
                    </View>
                    <Text style={[styles.nomOp, estSelectionne && styles.nomOpSelectionne]}>{op.nom}</Text>
                    {estSelectionne && (
                      <View style={[styles.pastilleSelection, { backgroundColor: op.couleur }]}>
                        <MaterialCommunityIcons name="check" size={12} color={op.id === 'mtn' ? '#000' : '#FFF'} />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* --- ETAPE 2 : NUMERO DU BENEFICIAIRE --- */}
          <View style={styles.sectionFormulaire}>
            <Text style={styles.labelSection}>2. Numero du beneficiaire</Text>
            <View style={styles.inputIconWrapper}>
              <MaterialCommunityIcons name="cellphone" size={20} color={Couleurs.texteGris} style={styles.inputIcon} />
              <TextInput
                style={styles.champSaisie}
                placeholder="Veuillez entrez le numero"
                placeholderTextColor={Couleurs.texteGris}
                keyboardType="phone-pad"
                value={numeroTelephone}
                onChangeText={setNumeroTelephone}
                maxLength={10}
              />
              <TouchableOpacity style={styles.btnRepertoire}>
                <MaterialCommunityIcons name="account"size={22} color={Couleurs.vertAgentrix} />
              </TouchableOpacity>
            </View>
          </View>

          {/* --- ETAPE 3 : CATEGORIE DU FORFAIT --- */}
          <View style={styles.sectionFormulaire}>
            <Text style={styles.labelSection}>3. Categorie du forfait</Text>
            <View style={styles.grilleCategories}>
              {listeCategories.map((cat) => {
                const estCatSelectionnee = categorieSelectionnee === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.carteCategorie,
                      estCatSelectionnee && { borderColor: Couleurs.vertAgentrix, backgroundColor: '#F0FDF4' }
                    ]}
                    onPress={() => {
                      setCategorieSelectionnee(cat.id);
                      setForfaitSelectionne(null);
                    }}
                    activeOpacity={0.8}
                  >
                    <MaterialCommunityIcons 
                      name={cat.icone} 
                      size={20} 
                      color={estCatSelectionnee ? Couleurs.vertAgentrix : Couleurs.texteGris} 
                    />
                    <Text style={[styles.nomCategorie, estCatSelectionnee && styles.nomCategorieSelectionne]}>
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* --- ETAPE 4 : SELECTION DU FORFAIT --- */}
          <View style={styles.sectionFormulaire}>
            <Text style={styles.labelSection}>4. Selectionnez le forfait</Text>
            <View style={styles.listeForfaits}>
              {forfaitsFiltres.length === 0 ? (
                <View style={styles.conteneurVide}>
                  <Text style={styles.texteVide}>Aucun forfait disponible pour cette categorie.</Text>
                </View>
              ) : (
                forfaitsFiltres.map((item) => {
                  const estCeForfaitSelectionne = forfaitSelectionne?.id === item.id;
                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={[styles.carteForfait, estCeForfaitSelectionne && styles.carteForfaitSelectionne]}
                      onPress={() => setForfaitSelectionne(item)}
                      activeOpacity={0.9}
                    >
                      <View style={styles.forfaitInfoGauche}>
                        <Text style={styles.forfaitNom}>{item.nom}</Text>
                        <View style={styles.forfaitMetaRow}>
                          <Text style={styles.forfaitMetaText}>
                            <MaterialCommunityIcons name="database" size={12} /> {item.volume}
                          </Text>
                          <Text style={[styles.forfaitMetaText, { marginLeft: 12 }]}>
                            <MaterialCommunityIcons name="clock-outline" size={12} /> {item.validite}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.forfaitInfoDroite}>
                        <Text style={[styles.forfaitPrix, estCeForfaitSelectionne && { color: Couleurs.vertAgentrix }]}>
                          {item.prix.toLocaleString()} <Text style={styles.forfaitDevise}>FCFA</Text>
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })
              )}
            </View>
          </View>

          {/* --- RECAPITULATIF --- */}
          <View style={styles.recapCard}>
            <View style={styles.recapLigneTotal}>
              <Text style={styles.recapLabelTotal}>Total a debiter :</Text>
              <Text style={styles.recapValeurTotal}>
                {forfaitSelectionne ? forfaitSelectionne.prix.toLocaleString() : 0} FCFA
              </Text>
            </View>
          </View>

          {/* --- BOUTON DE VALIDATION --- */}
          <TouchableOpacity 
            style={[styles.btnSoumettre, !forfaitSelectionne && styles.btnSoumettreDesactive]}
            onPress={validerVenteForfait}
            disabled={!forfaitSelectionne}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="cart-arrow-up" size={24} color="#FFF" style={{ marginRight: 8 }} />
            <Text style={styles.texteBtnSoumettre}>Activer le forfait</Text>
          </TouchableOpacity>

          {/* --- BOUTON DE RETOUR VERS L'ACCUEIL --- */}
          <TouchableOpacity 
            style={styles.btnRetourAccueil}
            onPress={retourAccueil}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="home" size={24} color={Couleurs.vertAgentrix} style={{ marginRight: 8 }} />
            <Text style={styles.texteBtnRetour}>Retour a l'accueil</Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 40,
  },
  headerPage: {
    marginBottom: 25,
    paddingTop : 55,
  },
  titrePage: {
    fontSize: 24,
    fontWeight: '800',
    color: Couleurs.texteNoir,
  },
  sousTitrePage: {
    fontSize: 13,
    color: Couleurs.texteGris,
    marginTop: 4,
    lineHeight: 18,
  },
  sectionFormulaire: {
    marginBottom: 24,
  },
  labelSection: {
    fontSize: 14,
    fontWeight: '700',
    color: Couleurs.texteNoir,
    marginBottom: 10,
  },
  grilleOperateurs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  carteChoixOp: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: 'transparent',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    position: 'relative',
  },
  logoConteneur: {
    width: 36,
    height: 36,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  nomOp: {
    fontSize: 11,
    fontWeight: '600',
    color: Couleurs.texteGris,
    marginTop: 6,
  },
  nomOpSelectionne: {
    color: Couleurs.texteNoir,
    fontWeight: '700',
  },
  pastilleSelection: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  grilleCategories: {
    flexDirection: 'row',
    gap: 8,
  },
  carteCategorie: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: 'transparent',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    gap: 6,
  },
  nomCategorie: {
    fontSize: 12,
    fontWeight: '600',
    color: Couleurs.texteGris,
  },
  nomCategorieSelectionne: {
    color: Couleurs.vertAgentrix,
    fontWeight: '700',
  },
  inputIconWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 52,
  },
  inputIcon: {
    marginRight: 10,
  },
  champSaisie: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: Couleurs.texteNoir,
    height: '100%',
  },
  btnRepertoire: {
    padding: 6,
  },
  listeForfaits: {
    gap: 10,
  },
  carteForfait: {
    backgroundColor: '#FFF',
    borderWidth: 1.5,
    borderColor: '#F3F4F6',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  carteForfaitSelectionne: {
    borderColor: Couleurs.vertAgentrix,
    backgroundColor: '#F0FDF4',
  },
  forfaitInfoGauche: {
    flex: 1,
  },
  forfaitNom: {
    fontSize: 15,
    fontWeight: '700',
    color: Couleurs.texteNoir,
  },
  forfaitMetaRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  forfaitMetaText: {
    fontSize: 12,
    color: Couleurs.texteGris,
    fontWeight: '500',
  },
  forfaitInfoDroite: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingLeft: 10,
  },
  forfaitPrix: {
    fontSize: 16,
    fontWeight: '800',
    color: Couleurs.texteNoir,
  },
  forfaitDevise: {
    fontSize: 11,
    fontWeight: '600',
    color: Couleurs.texteGris,
  },
  conteneurVide: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  texteVide: {
    fontSize: 13,
    color: Couleurs.texteGris,
  },
  recapCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    marginBottom: 25,
  },
  recapLigneTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recapLabelTotal: {
    fontSize: 14,
    fontWeight: '700',
    color: Couleurs.texteNoir,
  },
  recapValeurTotal: {
    fontSize: 16,
    fontWeight: '800',
    color: Couleurs.vertAgentrix,
  },
  btnSoumettre: {
    backgroundColor: '#0c803ef7',
    borderRadius: 12,
    height: 54,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0c803e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 15,
  },
  btnSoumettreDesactive: {
    backgroundColor: '#9CA3AF',
    shadowOpacity: 0,
    elevation: 0,
  },
  texteBtnSoumettre: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  btnRetourAccueil: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    height: 54,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Couleurs.vertAgentrix,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  texteBtnRetour: {
    color: Couleurs.vertAgentrix,
    fontSize: 16,
    fontWeight: '700',
  },
});

export default ForfaitScreen;