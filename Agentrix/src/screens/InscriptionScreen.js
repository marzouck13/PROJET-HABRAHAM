// screens/InscriptionScreen.js
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Image, SafeAreaView, ActivityIndicator,
  Alert, KeyboardAvoidingView, Platform, StatusBar
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StylesCommuns, Couleurs } from '../styles/ThemeAgentrix';
import { AuthService } from '../services/AgentrixApi';

const ETAPES = {
  FORMULAIRE: 1,
  OTP_EMAIL: 2,
  MOT_DE_PASSE: 3,
  AJOUT_NUMERO: 4,
  OTP_TELEPHONE: 5,
  TERMINE: 6,
};

const InscriptionScreen = ({ auConnexion, auRetour }) => {
  const [etape, setEtape] = useState(ETAPES.FORMULAIRE);
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('');
  const [passe, setPasse] = useState('');
  const [confirmationPasse, setConfirmationPasse] = useState('');
  const [voirPasse, setVoirPasse] = useState(false);
  const [codeOTP, setCodeOTP] = useState('');
  const [chargement, setChargement] = useState(false);
  const [userId, setUserId] = useState(null);
  const [operateurDetecte, setOperateurDetecte] = useState(null);

  const retournerEtapePrecedente = () => {
    if (etape === ETAPES.FORMULAIRE) auRetour();
    else {
      setEtape(etape - 1);
      setCodeOTP('');
    }
  };

  const sauvegarderLocalement = async (cle, donnees) => {
    try {
      const existant = await AsyncStorage.getItem(cle);
      const parsed = existant ? JSON.parse(existant) : {};
      await AsyncStorage.setItem(cle, JSON.stringify({ ...parsed, ...donnees }));
    } catch (erreur) {}
  };

  const extraireIdUtilisateur = (resultat) => {
    return resultat?.userId || resultat?.id || resultat?.data?.userId || resultat?.data?.id;
  };

  const gererInscription = async () => {
    setChargement(true);
    try {
      const resultat = await AuthService.register({
        nom: nom.trim(),
        prenom: prenom.trim(),
        email: email.trim().toLowerCase()
      });

      if (resultat?.success) {
        const idUtilisateur = extraireIdUtilisateur(resultat);
        setUserId(idUtilisateur);
        await sauvegarderLocalement('@agentrix_user', {
          Id: idUtilisateur,
          Name: `${prenom} ${nom}`,
          Email: email.trim().toLowerCase(),
          isEmailVerified: false,
          isPhoneVerified: false,
          isFullyVerified: false,
          dateInscription: new Date().toISOString()
        });
        setEtape(ETAPES.OTP_EMAIL);
      } else {
        Alert.alert('Erreur', resultat.message || 'Impossible de creer le compte.');
      }
    } catch (error) {
      Alert.alert('Erreur reseau', 'Verifiez votre connexion internet et reessayez.');
    } finally {
      setChargement(false);
    }
  };

  const verifierOtpEmail = async () => {
    setChargement(true);
    try {
      const resultat = await AuthService.verifyEmailOtp(email.trim().toLowerCase(), codeOTP);
      if (resultat?.success) {
        await sauvegarderLocalement('@agentrix_user', {
          isEmailVerified: true,
          emailVerifiedAt: new Date().toISOString()
        });
        setCodeOTP('');
        setEtape(ETAPES.MOT_DE_PASSE);
      } else {
        Alert.alert('Echec', resultat.message || 'Code incorrect ou expire.');
      }
    } catch (error) {
      Alert.alert('Erreur reseau', 'Verifiez votre connexion internet et reessayez.');
    } finally {
      setChargement(false);
    }
  };

  const definirMotDePasse = async () => {
    setChargement(true);
    try {
      const resultat = await AuthService.setPassword(userId, passe);
      if (resultat?.success) {
        await sauvegarderLocalement('@agentrix_user', {
          passwordDefini: true,
          datePassword: new Date().toISOString()
        });
        setPasse('');
        setConfirmationPasse('');
        setEtape(ETAPES.AJOUT_NUMERO);
      } else {
        Alert.alert('Erreur', resultat.message || 'Impossible de definir le mot de passe.');
      }
    } catch (error) {
      Alert.alert('Erreur reseau', 'Verifiez votre connexion internet et reessayez.');
    } finally {
      setChargement(false);
    }
  };

  const ajouterNumero = async () => {
    setChargement(true);
    try {
      const resultat = await AuthService.addNumber(userId, telephone.trim());
      if (resultat?.success) {
        setOperateurDetecte(resultat.data?.operateur || resultat.operator);
        await sauvegarderLocalement('@agentrix_numbers', {
          PhoneNumber: telephone.trim(),
          Reseau: resultat.data?.operateur || resultat.operator,
          UserKey: userId,
          isVerified: false,
          isActive: true,
          dateAjout: new Date().toISOString()
        });
        setEtape(ETAPES.OTP_TELEPHONE);
      } else {
        Alert.alert('Erreur', resultat.message || 'Numero non supporte ou deja utilise.');
      }
    } catch (error) {
      Alert.alert('Erreur reseau', 'Verifiez votre connexion internet et reessayez.');
    } finally {
      setChargement(false);
    }
  };

  const verifierOtpTelephone = async () => {
    setChargement(true);
    try {
      const resultat = await AuthService.verifyPhoneOtp(telephone.trim(), codeOTP);
      if (resultat?.success) {
        await sauvegarderLocalement('@agentrix_user', {
          isPhoneVerified: true,
          phoneVerifiedAt: new Date().toISOString(),
          isFullyVerified: true
        });
        await sauvegarderLocalement('@agentrix_numbers', {
          isVerified: true,
          verifiedAt: new Date().toISOString()
        });
        await AsyncStorage.setItem('@agentrix_connecte', 'true');
        setCodeOTP('');
        setEtape(ETAPES.TERMINE);
      } else {
        Alert.alert('Echec', resultat.message || 'Code incorrect ou expire.');
      }
    } catch (error) {
      Alert.alert('Erreur reseau', 'Verifiez votre connexion internet et reessayez.');
    } finally {
      setChargement(false);
    }
  };

  const renderEtape1Formulaire = () => (
    <View>
      <View style={styles.headerTexte}>
        <Text style={StylesCommuns.grandTitre}>Creer un compte</Text>
        <View style={styles.barreAccents} />
        <Text style={StylesCommuns.sousTitre}>Rejoignez le reseau Agentrix et gerez vos finances en toute securite.</Text>
      </View>
      <Text style={StylesCommuns.label}>Nom</Text>
      <View style={styles.inputStyle}>
        <MaterialCommunityIcons name="account-outline" size={20} color={Couleurs.vertAgentrix} style={styles.icon} />
        <TextInput style={StylesCommuns.inputText} placeholder="Votre nom" value={nom} onChangeText={setNom} />
      </View>
      <Text style={StylesCommuns.label}>Prenom</Text>
      <View style={styles.inputStyle}>
        <MaterialCommunityIcons name="account-outline" size={20} color={Couleurs.vertAgentrix} style={styles.icon} />
        <TextInput style={StylesCommuns.inputText} placeholder="Votre prenom" value={prenom} onChangeText={setPrenom} />
      </View>
      <Text style={StylesCommuns.label}>Email</Text>
      <View style={styles.inputStyle}>
        <MaterialCommunityIcons name="email-outline" size={20} color={Couleurs.vertAgentrix} style={styles.icon} />
        <TextInput style={StylesCommuns.inputText} placeholder="exemple@email.com" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
      </View>
      <TouchableOpacity style={[StylesCommuns.boutonVert, styles.shadowBouton, { marginTop: 30 }]} onPress={gererInscription}>
        <Text style={StylesCommuns.texteBouton}>Continuer</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.footer} onPress={auConnexion}>
        <Text style={styles.footerTxt}>Deja inscrit ? <Text style={styles.footerLink}>Se connecter</Text></Text>
      </TouchableOpacity>
    </View>
  );

  const renderEtape2OtpEmail = () => (
    <View>
      <View style={styles.headerTexte}>
        <Text style={StylesCommuns.grandTitre}>Verification email</Text>
        <View style={styles.barreAccents} />
        <Text style={StylesCommuns.sousTitre}>Un code de confirmation a ete envoye a <Text style={{ fontWeight: '700' }}>{email}</Text></Text>
      </View>
      <Text style={StylesCommuns.label}>Code de validation (6 chiffres)</Text>
      <View style={styles.inputStyle}>
        <MaterialCommunityIcons name="shield-check-outline" size={20} color={Couleurs.vertAgentrix} style={styles.icon} />
        <TextInput style={[StylesCommuns.inputText, { letterSpacing: 5, fontSize: 18, fontWeight: '700' }]} placeholder="......" keyboardType="number-pad" maxLength={6} value={codeOTP} onChangeText={setCodeOTP} />
      </View>
      <TouchableOpacity style={[StylesCommuns.boutonVert, styles.shadowBouton, { marginTop: 30 }]} onPress={verifierOtpEmail}>
        <Text style={StylesCommuns.texteBouton}>Verifier mon email</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.footer} onPress={() => setEtape(ETAPES.FORMULAIRE)}>
        <Text style={styles.footerTxt}>Modifier l'adresse email</Text>
      </TouchableOpacity>
    </View>
  );

  const renderEtape3MotDePasse = () => (
    <View>
      <View style={styles.headerTexte}>
        <Text style={StylesCommuns.grandTitre}>Securisez votre compte</Text>
        <View style={styles.barreAccents} />
        <Text style={StylesCommuns.sousTitre}>Choisissez un mot de passe robuste pour proteger vos donnees.</Text>
      </View>
      <Text style={StylesCommuns.label}>Mot de passe</Text>
      <View style={styles.inputStyle}>
        <MaterialCommunityIcons name="lock-outline" size={20} color={Couleurs.vertAgentrix} style={styles.icon} />
        <TextInput style={StylesCommuns.inputText} placeholder="6 caracteres minimum" secureTextEntry={!voirPasse} value={passe} onChangeText={setPasse} />
        <TouchableOpacity onPress={() => setVoirPasse(!voirPasse)}>
          <MaterialCommunityIcons name={voirPasse ? "eye-off-outline" : "eye-outline"} size={20} color={Couleurs.texteGris} />
        </TouchableOpacity>
      </View>
      <Text style={[StylesCommuns.label, { marginTop: 15 }]}>Confirmer le mot de passe</Text>
      <View style={styles.inputStyle}>
        <MaterialCommunityIcons name="lock-check-outline" size={20} color={Couleurs.vertAgentrix} style={styles.icon} />
        <TextInput style={StylesCommuns.inputText} placeholder="Repetez le mot de passe" secureTextEntry={!voirPasse} value={confirmationPasse} onChangeText={setConfirmationPasse} />
      </View>
      <TouchableOpacity style={[StylesCommuns.boutonVert, styles.shadowBouton, { marginTop: 30 }]} onPress={definirMotDePasse}>
        <Text style={StylesCommuns.texteBouton}>Valider le mot de passe</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.footer} onPress={() => setEtape(ETAPES.OTP_EMAIL)}>
        <Text style={styles.footerTxt}>Retour</Text>
      </TouchableOpacity>
    </View>
  );

  const renderEtape4AjoutNumero = () => (
    <View>
      <View style={styles.headerTexte}>
        <Text style={StylesCommuns.grandTitre}>Votre numero mobile</Text>
        <View style={styles.barreAccents} />
        <Text style={StylesCommuns.sousTitre}>Associez votre ligne mobile pour acceder aux services de transaction.</Text>
      </View>
      <Text style={StylesCommuns.label}>Numero de telephone</Text>
      <View style={styles.inputStyle}>
        <Image source={{ uri: 'https://flagcdn.com/w40/bj.png' }} style={styles.flag} />
        <Text style={styles.prefix}>+229</Text>
        <TextInput style={StylesCommuns.inputText} placeholder="Numero mobile" keyboardType="phone-pad" maxLength={10} value={telephone} onChangeText={setTelephone} />
      </View>
      <View style={styles.infoOperateur}>
        <MaterialCommunityIcons name="information-outline" size={16} color={Couleurs.texteGris} />
        <Text style={styles.infoOperateurTexte}>Operateur detecte automatiquement (MTN, MOOV ou CELTIIS)</Text>
      </View>
      <TouchableOpacity style={[StylesCommuns.boutonVert, styles.shadowBouton, { marginTop: 30 }]} onPress={ajouterNumero}>
        <Text style={StylesCommuns.texteBouton}>Recevoir le code SMS</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.footer} onPress={() => setEtape(ETAPES.MOT_DE_PASSE)}>
        <Text style={styles.footerTxt}>Retour</Text>
      </TouchableOpacity>
    </View>
  );

  const renderEtape5OtpTelephone = () => (
    <View>
      <View style={styles.headerTexte}>
        <Text style={StylesCommuns.grandTitre}>Verification telephone</Text>
        <View style={styles.barreAccents} />
        <Text style={StylesCommuns.sousTitre}>Un code de confirmation a ete envoye au <Text style={{ fontWeight: '700' }}>+229 {telephone}</Text></Text>
      </View>
      <Text style={StylesCommuns.label}>Code SMS (6 chiffres)</Text>
      <View style={styles.inputStyle}>
        <MaterialCommunityIcons name="cellphone-check" size={20} color={Couleurs.vertAgentrix} style={styles.icon} />
        <TextInput style={[StylesCommuns.inputText, { letterSpacing: 5, fontSize: 18, fontWeight: '700' }]} placeholder="......" keyboardType="number-pad" maxLength={6} value={codeOTP} onChangeText={setCodeOTP} />
      </View>
      <TouchableOpacity style={[StylesCommuns.boutonVert, styles.shadowBouton, { marginTop: 30 }]} onPress={verifierOtpTelephone}>
        <Text style={StylesCommuns.texteBouton}>Finaliser l'inscription</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.footer} onPress={() => setEtape(ETAPES.AJOUT_NUMERO)}>
        <Text style={styles.footerTxt}>Modifier le numero de telephone</Text>
      </TouchableOpacity>
    </View>
  );

  const renderEtape6Termine = () => (
    <View style={styles.conteneurSucces}>
      <View style={styles.cercleSucces}>
        <MaterialCommunityIcons name="check" size={50} color="#FFF" />
      </View>
      <Text style={[StylesCommuns.grandTitre, { textAlign: 'center', marginTop: 20 }]}>Inscription terminee</Text>
      <View style={[styles.barreAccents, { alignSelf: 'center' }]} />
      <Text style={[StylesCommuns.sousTitre, { textAlign: 'center', marginBottom: 30 }]}>Votre compte Agentrix est desormais actif.</Text>
      <TouchableOpacity style={[StylesCommuns.boutonVert, styles.shadowBouton]} onPress={auConnexion}>
        <Text style={StylesCommuns.texteBouton}>Se connecter</Text>
      </TouchableOpacity>
    </View>
  );

  const renderEtapeActuelle = () => {
    switch (etape) {
      case ETAPES.FORMULAIRE: return renderEtape1Formulaire();
      case ETAPES.OTP_EMAIL: return renderEtape2OtpEmail();
      case ETAPES.MOT_DE_PASSE: return renderEtape3MotDePasse();
      case ETAPES.AJOUT_NUMERO: return renderEtape4AjoutNumero();
      case ETAPES.OTP_TELEPHONE: return renderEtape5OtpTelephone();
      case ETAPES.TERMINE: return renderEtape6Termine();
      default: return renderEtape1Formulaire();
    }
  };

  return (
    <SafeAreaView style={[StylesCommuns.conteneur, { backgroundColor: Couleurs.fond }]}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.cercleDeco1} />
      <View style={styles.cercleDeco2} />
      <View style={styles.cercleDeco3} />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 25, paddingBottom: 30 }} keyboardShouldPersistTaps="handled">
          {etape !== ETAPES.TERMINE && (
            <TouchableOpacity onPress={retournerEtapePrecedente} style={styles.backBtn}>
              <MaterialCommunityIcons name="arrow-left" size={28} color={Couleurs.texteNoir} />
            </TouchableOpacity>
          )}
          {renderEtapeActuelle()}
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
  inputStyle: { ...StylesCommuns.inputContainer, backgroundColor: '#F9FAFB', borderColor: '#F3F4F6', marginBottom: 15 },
  backBtn: { marginTop: Platform.OS === 'android' ? 50 : 30, marginBottom: 10, width: 40, height: 40, justifyContent: 'center' },
  icon: { marginRight: 12 },
  flag: { width: 24, height: 16, marginRight: 8 },
  prefix: { fontSize: 16, fontWeight: '700', marginRight: 5, color: '#000' },
  footer: { marginTop: 20, alignItems: 'center' },
  footerTxt: { color: Couleurs.texteGris, fontSize: 15 },
  footerLink: { color: Couleurs.vertAgentrix, fontWeight: '700' },
  shadowBouton: { elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3 },
  infoOperateur: { flexDirection: 'row', alignItems: 'center', marginTop: 5, paddingHorizontal: 5 },
  infoOperateurTexte: { fontSize: 12, color: Couleurs.texteGris, marginLeft: 5, fontStyle: 'italic' },
  conteneurSucces: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  cercleSucces: { width: 100, height: 100, borderRadius: 50, backgroundColor: Couleurs.vertAgentrix, justifyContent: 'center', alignItems: 'center' },
});

export default InscriptionScreen;