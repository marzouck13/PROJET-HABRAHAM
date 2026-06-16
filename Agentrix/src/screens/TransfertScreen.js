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

const TransfertScreen = ({ setAppState }) => {
  // --- ETATS ---
  const [operateurSelectionne, setOperateurSelectionne] = useState('mtn');
  const [numeroTelephone, setNumeroTelephone] = useState('');
  const [montant, setMontant] = useState('');

  // Liste des operateurs actifs pour le transfert
  const listeOperateurs = [
    { id: 'mtn', nom: 'MTN MoMo', couleur: '#FFCC00', logo: require('../../assets/images/mtn.png') },
    { id: 'moov', nom: 'Moov Money', couleur: '#0062ad', logo: require('../../assets/images/moov.png') },
    { id: 'celtiis', nom: 'Celtiis Cash', couleur: '#1a3a6e', logo: require('../../assets/images/celtiis.png') },
  ];

  // Raccourcis de montants rapides (FCFA)
  const montantsRapides = [500, 1000, 2000, 5000, 10000, 25000];

  // --- LOGIQUE METIER ---
  const gererChangementMontant = (texte) => {
    // Supprimer tout caractere non numerique
    const texteNettoye = texte.replace(/[^0-9]/g, '');
    setMontant(texteNettoye);
  };

  const selectionnerMontantRapide = (valeur) => {
    const chaineValeur = valeur.toString();
    setMontant(chaineValeur);
  };

  const validerTransfert = () => {
    if (!numeroTelephone || numeroTelephone.length < 8) {
      Alert.alert("Erreur", "Veuillez saisir un numero de telephone valide a 8 ou 10 chiffres.");
      return;
    }
    if (!montant || parseFloat(montant) <= 0) {
      Alert.alert("Erreur", "Veuillez saisir un montant superieur a 0 FCFA.");
      return;
    }

    const operateurCode = listeOperateurs.find(op => op.id === operateurSelectionne)?.nom;

    // Fenetre de confirmation avant de lancer l'operation transactionnelle
    Alert.alert(
      "Confirmer le Transfert",
      `Vous allez transferer :\n\n- Montant : ${parseInt(montant).toLocaleString()} FCFA\n- Beneficiaire : ${numeroTelephone}\n- Operateur : ${operateurCode}\n\nSouhaitez-vous continuer ?`,
      [
        { text: "Annuler", style: "cancel" },
        { 
          text: "Confirmer", 
          onPress: () => executerTransaction() 
        }
      ]
    );
  };

  const executerTransaction = () => {
    // Logique reseau ou appel service Supabase/FastAPI a venir
    Alert.alert("Succes", "Le transfert a ete initie avec succes !");
    // Reinitialisation des champs apres validation reussie
    setNumeroTelephone('');
    setMontant('');
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
            <Text style={styles.titrePage}>Nouveau Transfert</Text>
            <Text style={styles.sousTitrePage}>Effectuez des depots d'argent vers vos clients rapidement.</Text>
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
                    onPress={() => setOperateurSelectionne(op.id)}
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
                maxLength={15}
              />
              <TouchableOpacity style={styles.btnRepertoire}>
                <MaterialCommunityIcons name="account" size={22} color={Couleurs.vertAgentrix} />
              </TouchableOpacity>
            </View>
          </View>

          {/* --- ETAPE 3 : MONTANT DE LA TRANSACTION --- */}
          <View style={styles.sectionFormulaire}>
            <Text style={styles.labelSection}>3. Montant a transferer</Text>
            <View style={styles.inputIconWrapper}>
              <MaterialCommunityIcons name="cash" size={20} color={Couleurs.texteGris} style={styles.inputIcon} />
              <TextInput
                style={styles.champSaisie}
                placeholder="Entrez le montant"
                placeholderTextColor={Couleurs.texteGris}
                keyboardType="numeric"
                value={montant}
                onChangeText={gererChangementMontant}
              />
              <Text style={styles.deviseSuffixe}>FCFA</Text>
            </View>

            {/* Puces de choix rapide */}
            <View style={styles.conteneurMontantsRapides}>
              {montantsRapides.map((val) => (
                <TouchableOpacity
                  key={val}
                  style={styles.puceMontant}
                  onPress={() => selectionnerMontantRapide(val)}
                >
                  <Text style={styles.textePuceMontant}>+{val.toLocaleString()}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* --- RECAPITULATIF SIMPLE --- */}
          <View style={styles.recapCard}>
            <View style={styles.recapLigneTotal}>
              <Text style={styles.recapLabelTotal}>Montant a transferer :</Text>
              <Text style={styles.recapValeurTotal}>
                {montant ? parseFloat(montant).toLocaleString() : 0} FCFA
              </Text>
            </View>
          </View>

          {/* --- BOUTON DE VALIDATION --- */}
          <TouchableOpacity 
            style={styles.btnSoumettre}
            onPress={validerTransfert}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="send-circle" size={24} color="#FFF" style={{ marginRight: 8 }} />
            <Text style={styles.texteBtnSoumettre}>Envoyer le transfert</Text>
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
    paddingTop: 65,
    paddingBottom: 40,
  },
  backButton: {
    marginTop: 10,
    marginBottom: 5,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerPage: {
    marginBottom: 25,
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
  deviseSuffixe: {
    fontSize: 14,
    fontWeight: '700',
    color: Couleurs.texteGris,
  },
  conteneurMontantsRapides: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  puceMontant: {
    backgroundColor: '#EeF9F3',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(12, 128, 62, 0.15)',
  },
  textePuceMontant: {
    color: Couleurs.vertAgentrix,
    fontSize: 12,
    fontWeight: '700',
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

export default TransfertScreen;