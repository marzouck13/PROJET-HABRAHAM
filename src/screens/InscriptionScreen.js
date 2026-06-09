import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  ScrollView, Image, SafeAreaView, ActivityIndicator,
  Alert, KeyboardAvoidingView, Platform, StatusBar
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StylesCommuns, Couleurs } from '../styles/ThemeAgentrix';

// Importation du service API
import { AuthService } from '../services/AgentrixApi';

const InscriptionScreen = ({ auConnexion, auRetour }) => {
  // --- ÉTATS DU FORMULAIRE ---
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [email, setEmail] = useState('');
  const [npi, setNpi] = useState('');
  const [telephone, setTelephone] = useState('');
  const [passe, setPasse] = useState('');
  const [voirPasse, setVoirPasse] = useState(false);
  
  // --- ÉTATS DE VÉRIFICATION OTP ---
  const [etape, setEtape] = useState(1); // 1: Formulaire, 2: Code SMS
  const [codeOTP, setCodeOTP] = useState('');
  const [chargement, setChargement] = useState(false);

  // Étape 1 : Envoyer les infos au Backend
  const gererInscription = async () => {
    // 1. Validations locales
    if (!nom.trim() || !prenom.trim() || !email.trim() || !npi.trim() || !telephone.trim() || !passe.trim()) {
      Alert.alert("Champs incomplets", "Veuillez remplir toutes les informations.");
      return;
    }

    // Validation email
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regexEmail.test(email.trim())) {
      Alert.alert("Email invalide", "Veuillez entrer une adresse email valide.");
      return;
    }

    // Validation NPI (exemple : 8 à 15 chiffres)
    if (npi.trim().length < 8 || npi.trim().length > 15) {
      Alert.alert("NPI invalide", "Le Numéro Personnel d'Identification doit comporter entre 8 et 15 caractères.");
      return;
    }

    if (telephone.trim().length !== 10) {
      Alert.alert("Numéro invalide", "Le numéro de téléphone doit comporter exactement 10 chiffres.");
      return;
    }

    if (passe.length < 6) {
      Alert.alert("Sécurité", "Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    setChargement(true);
    console.log("🚀 [LOG] Inscription : Envoi des données au serveur...");
    
    const payload = {
      name: nom,
      firstname: prenom,
      email: email,
      NPI: npi,
      number: telephone,
      password: passe
    };

    try {
      const response = await AuthService.register(payload);
      console.log("✅ [LOG] Réponse Inscription :", JSON.stringify(response, null, 2));

      if (response.success) {
        // Le backend a créé le compte et envoyé le SMS
        console.log("📱 [LOG]",response.message);
        setEtape(2); 
      } else {
        // Cas : Numéro déjà utilisé, etc.
        Alert.alert("Erreur", response.message || "Impossible de créer le compte.");
      }
    } catch (error) {
      console.error("❌ [LOG] Erreur Inscription :", error);
      Alert.alert("Erreur réseau", error.message || "Vérifiez votre connexion.");
    } finally {
      setChargement(false);
    }
  };

  // Étape 2 : Valider le code OTP réel auprès du Backend
  const validerCodeEtFinaliser = async () => {
    if (codeOTP.length !== 6) {
      Alert.alert("Code invalide", "Veuillez entrer le code à 6 chiffres reçu.");
      return;
    }

    setChargement(true);
    console.log("🚀 [LOG] Vérification du code OTP...");

    try {
      const response = await AuthService.verifyCode(telephone, codeOTP);
      console.log("✅ [LOG] Réponse Vérification :", JSON.stringify(response, null, 2));

      if (response.success) {
        Alert.alert(
          "Inscription réussie ✨", 
          "Votre compte Agentrix est désormais actif.",
          [{ text: "Se connecter", onPress: auConnexion }]
        );
      } else {
        console.warn("⚠️ [LOG] Code erroné selon le serveur.");
        Alert.alert("Échec", response.message || "Code incorrect.");
      }
    } catch (error) {
      console.error("❌ [LOG] Erreur de validation :", error);
      Alert.alert("Erreur", error.message || "Une erreur est survenue lors de la validation.");
    } finally {
      setChargement(false);
    }
  };

  return (
    <SafeAreaView style={[StylesCommuns.conteneur, { backgroundColor: Couleurs.fond }]}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.cercleDeco1} />
      <View style={styles.cercleDeco2} />
      <View style={styles.cercleDeco3} />

      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 25, paddingBottom: 30 }}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity 
            onPress={etape === 1 ? auRetour : () => setEtape(1)} 
            style={styles.backBtn} 
            disabled={chargement}
          >
            <MaterialCommunityIcons name="arrow-left" size={28} color={Couleurs.texteNoir} />
          </TouchableOpacity>

          {etape === 1 ? (
            /* --- VUE ÉTAPE 1 : FORMULAIRE --- */
            <View>
              <View style={styles.headerTexte}>
                <Text style={StylesCommuns.grandTitre}>Créer un compte</Text>
                <View style={styles.barreAccents} />
                <Text style={StylesCommuns.sousTitre}>
                  Rejoignez le réseau Agentrix et gérez vos finances en toute sécurité.
                </Text>
              </View>

              <Text style={StylesCommuns.label}>Nom</Text>
              <View style={styles.inputStyle}>
                <MaterialCommunityIcons name="account-outline" size={20} color={Couleurs.vertAgentrix} style={styles.icon} />
                <TextInput style={StylesCommuns.inputText} placeholder="Nom de famille" value={nom} onChangeText={setNom} editable={!chargement} />
              </View>

              <Text style={StylesCommuns.label}>Prénom</Text>
              <View style={styles.inputStyle}>
                <MaterialCommunityIcons name="account-outline" size={20} color={Couleurs.vertAgentrix} style={styles.icon} />
                <TextInput style={StylesCommuns.inputText} placeholder="Prénom" value={prenom} onChangeText={setPrenom} editable={!chargement} />
              </View>

              <Text style={StylesCommuns.label}>Email</Text>
              <View style={styles.inputStyle}>
                <MaterialCommunityIcons name="email-outline" size={20} color={Couleurs.vertAgentrix} style={styles.icon} />
                <TextInput 
                  style={StylesCommuns.inputText} 
                  placeholder="exemple@email.com" 
                  keyboardType="email-address" 
                  autoCapitalize="none"
                  value={email} 
                  onChangeText={setEmail} 
                  editable={!chargement} 
                />
              </View>

              <Text style={StylesCommuns.label}>NPI (Numéro Personnel d'Identification)</Text>
              <View style={styles.inputStyle}>
                <MaterialCommunityIcons name="card-account-details-outline" size={20} color={Couleurs.vertAgentrix} style={styles.icon} />
                <TextInput 
                  style={StylesCommuns.inputText} 
                  placeholder="Votre NPI" 
                  keyboardType="default"
                  value={npi} 
                  onChangeText={setNpi} 
                  editable={!chargement} 
                />
              </View>

              <Text style={StylesCommuns.label}>Numéro de téléphone</Text>
              <View style={styles.inputStyle}>
                <Image source={{uri: 'https://flagcdn.com/w40/bj.png'}} style={styles.flag} />
                <Text style={styles.prefix}>+229</Text>
                <TextInput 
                  style={StylesCommuns.inputText} 
                  placeholder="Numéro mobile" 
                  keyboardType="phone-pad" 
                  maxLength={10} 
                  value={telephone} 
                  onChangeText={setTelephone} 
                  editable={!chargement} 
                />
              </View>

              <Text style={StylesCommuns.label}>Mot de passe</Text>
              <View style={styles.inputStyle}>
                <MaterialCommunityIcons name="lock-outline" size={20} color={Couleurs.vertAgentrix} style={styles.icon} />
                <TextInput 
                  style={StylesCommuns.inputText} 
                  placeholder="••••••••" 
                  secureTextEntry={!voirPasse} 
                  value={passe} 
                  onChangeText={setPasse} 
                  editable={!chargement} 
                />
                <TouchableOpacity onPress={() => setVoirPasse(!voirPasse)}>
                  <MaterialCommunityIcons name={voirPasse ? "eye-off-outline" : "eye-outline"} size={20} color={Couleurs.texteGris} />
                </TouchableOpacity>
              </View>

              <TouchableOpacity 
                style={[StylesCommuns.boutonVert, styles.shadowBouton, { marginTop: 30 }]} 
                onPress={gererInscription} 
                disabled={chargement}
              >
                {chargement ? <ActivityIndicator color="#FFF" /> : <Text style={StylesCommuns.texteBouton}>S'inscrire</Text>}
              </TouchableOpacity>
            </View>
          ) : (
            /* --- VUE ÉTAPE 2 : CODE SMS --- */
            <View>
              <View style={styles.headerTexte}>
                <Text style={StylesCommuns.grandTitre}>Vérification</Text>
                <View style={styles.barreAccents} />
                <Text style={StylesCommuns.sousTitre}>
                  Un code de confirmation a été envoyé au <Text style={{fontWeight:'700'}}> +229 {telephone}</Text>.
                </Text>
              </View>

              <Text style={StylesCommuns.label}>Code de validation (6 chiffres)</Text>
              <View style={styles.inputStyle}>
                <MaterialCommunityIcons name="shield-check-outline" size={20} color={Couleurs.vertAgentrix} style={styles.icon} />
                <TextInput 
                  style={[StylesCommuns.inputText, { letterSpacing: 5, fontSize: 18, fontWeight: '700' }]} 
                  placeholder="... ... ..." 
                  keyboardType="number-pad" 
                  maxLength={6}
                  value={codeOTP}
                  onChangeText={setCodeOTP}
                  editable={!chargement}
                />
              </View>

              <TouchableOpacity 
                style={[StylesCommuns.boutonVert, styles.shadowBouton, { marginTop: 30 }]} 
                onPress={validerCodeEtFinaliser} 
                disabled={chargement}
              >
                {chargement ? <ActivityIndicator color="#FFF" /> : <Text style={StylesCommuns.texteBouton}>Valider mon inscription</Text>}
              </TouchableOpacity>

              <TouchableOpacity style={styles.footer} onPress={() => setEtape(1)} disabled={chargement}>
                <Text style={styles.footerTxt}>Modifier le numéro de téléphone</Text>
              </TouchableOpacity>
            </View>
          )}

          {etape === 1 && (
            <TouchableOpacity style={styles.footer} onPress={auConnexion}>
              <Text style={styles.footerTxt}>Déjà inscrit ? <Text style={styles.footerLink}>Se connecter</Text></Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  cercleDeco1: { position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: 100, backgroundColor: '#49975140', zIndex: -1 },
  cercleDeco2: { position: 'absolute', bottom: -50, left: -50, width: 150, height: 150, borderRadius: 75, backgroundColor: '#2c7a343c', zIndex: -1 },
  cercleDeco3: { position: 'absolute', top: '40%', right: -30, width: 60, height: 60, borderRadius: 30, backgroundColor: '#49975134', zIndex: -1 },
  headerTexte: { marginTop: 10, marginBottom: 15 },
  barreAccents: { width: 40, height: 5, backgroundColor: Couleurs.vertAgentrix, borderRadius: 10, marginVertical: 8 },
  inputStyle: { ...StylesCommuns.inputContainer, backgroundColor: '#F9FAFB', borderColor: '#F3F4F6' },
  backBtn: { marginTop: Platform.OS === 'android' ? 50 : 30, marginBottom: 10, width: 40, height: 40, justifyContent:'center' },
  icon: { marginRight: 12 },
  flag: { width: 24, height: 16, marginRight: 8 },
  prefix: { fontSize: 16, fontWeight: '700', marginRight: 5, color: '#000' },
  footer: { marginTop: 20, alignItems: 'center' },
  footerTxt: { color: Couleurs.texteGris, fontSize: 15 },
  footerLink: { color: Couleurs.vertAgentrix, fontWeight: '700' },
  shadowBouton: { elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3 }
});

export default InscriptionScreen;