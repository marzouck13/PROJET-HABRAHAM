import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  Image, 
  SafeAreaView, 
  ActivityIndicator,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StylesCommuns, Couleurs } from '../styles/ThemeAgentrix';
import { AuthService } from '../services/AgentrixApi';

const { width } = Dimensions.get('window');

const OublieMdpScreen = ({ auRetour }) => {
  // Gestion des etapes : 1 = Envoi OTP, 2 = Verification & Nouveau MDP
  const [etape, setEtape] = useState(1);
  const [telephone, setTelephone] = useState('');
  const [codeOTP, setCodeOTP] = useState('');
  const [nouveauPasse, setNouveauPasse] = useState('');
  const [voirPasse, setVoirPasse] = useState(false);
  const [chargement, setChargement] = useState(false);

  // Etape 1 : Envoyer le code
  const gererEnvoiCode = async () => {
    // Validation du numero (10 chiffres)
    if (!telephone.trim() || telephone.trim().length !== 10) {
      Alert.alert("Numero invalide", "Veuillez entrer un numero de telephone valide a 10 chiffres.");
      return;
    }
    setChargement(true);
    
    try {
          console.log(`[AUTH_RECOVERY] Tentative d'envoi OTP pour : ${telephone}`);
          const response = await AuthService.forgotPassword(telephone);
          console.log("[SERVER_RESPONSE] ForgotPassword :", JSON.stringify(response, null, 2));
          
          if (response.success) {
            console.log("[OTP_SENT] Le code de recuperation a ete expedie.");
            setEtape(2); 
          } else {
            Alert.alert("Erreur", response.message || "Impossible d'envoyer le numero.");
          }
        } catch (error) {
          console.error("[NETWORK_ERROR] Echec de la demande OTP :", error);
          Alert.alert("Erreur reseau", error.message || "Verifiez votre connexion.");
        } finally {
          setChargement(false);
        }
  };

  // Etape 2 : Reinitialiser
  const gererReinitialisation = async () => {
    // 1. Verification des champs
    if (!codeOTP.trim() || !nouveauPasse.trim()) {
      Alert.alert("Champs requis", "Veuillez remplir le code recu et votre nouveau mot de passe.");
      return;
    }

    // 2. Verification du code OTP (6 chiffres)
    if (codeOTP.trim().length !== 6) {
      Alert.alert("Code incomplet", "Le code de verification doit comporter 6 chiffres.");
      return;
    }

    // 3. Validation de la complexite du mot de passe (6 caracteres uniques)
    const caracteresUniques = new Set(nouveauPasse).size;
    if (caracteresUniques < 6) {
      Alert.alert(
        "Securite insuffisante", 
        "Votre nouveau mot de passe doit contenir au moins 6 caracteres differents."
      );
      return;
    }

    setChargement(true);
    try {
         console.log(`[AUTH_RESET] Reinitialisation en cours pour ${telephone}`);
         // Correction syntaxe : Appel des arguments selon la definition du service
         const paload={
          number:telephone,
          code:codeOTP,
          newPassword:nouveauPasse
         }
         const response = await AuthService.resetPassword(paload);
         console.log("[SERVER_RESPONSE] ResetPassword :", JSON.stringify(response, null, 2));
   
         if (response.success) {
           console.log("[SUCCESS] Mot de passe reinitialise avec succes.");
           Alert.alert("Succes", "Votre mot de passe a ete modifie.", [{ text: "OK", onPress: auRetour }]);
         } else {
           Alert.alert("Erreur", response.message || "Impossible de reinitialiser.");
         }
       } catch (error) {
         console.error("[API_ERROR] Echec lors du changement de mot de passe :", error);
         Alert.alert("Erreur reseau", error.message || "Verifiez votre connexion.");
       } finally {
         setChargement(false);
       }
  };

  return (
    <SafeAreaView style={StylesCommuns.conteneur}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        {/* Elements de Decoration en Arriere-plan */}
        <View style={styles.cercleDeco1} />
        <View style={styles.cercleDeco2} />
        <View style={styles.cercleDeco3} />

        <ScrollView 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={[StylesCommuns.safeArea, { flexGrow: 1 }]}
          keyboardShouldPersistTaps="handled"
        >
          {/* Gestion intelligente du retour */}
          <TouchableOpacity 
            onPress={() => etape === 1 ? auRetour() : setEtape(1)} 
            style={styles.backBtn}
            disabled={chargement}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color={Couleurs.texteNoir} />
          </TouchableOpacity>

          <View style={styles.headerTexte}>
            <Text style={[StylesCommuns.grandTitre, {textAlign: 'left'}]}>
              {etape === 1 ? "Mot de passe oublie" : "Reinitialisation"}
            </Text>
            <View style={styles.barreAccents} />
            <Text style={[StylesCommuns.sousTitre, {textAlign: 'left', marginTop: 10}]}>
              {etape === 1 
                ? "Entrez votre numero pour recevoir un code de verification par SMS." 
                : "Entrez le code recu et choisissez votre nouveau mot de passe."}
            </Text>
          </View>

          {/* --- ETAPE 1 : RECUPERATION DU COMPTE --- */}
          {etape === 1 && (
            <View>
              <Text style={StylesCommuns.label}>Numero de telephone</Text>
              <View style={styles.inputStyle}>
                <Image source={{uri: 'https://flagcdn.com/w40/bj.png'}} style={styles.flag} />
                <Text style={styles.prefix}>+229</Text>
                <TextInput 
                  style={StylesCommuns.inputText} 
                  placeholder="Numero mobile" 
                  keyboardType="phone-pad"
                  maxLength={10}
                  value={telephone}
                  onChangeText={setTelephone}
                  editable={!chargement}
                />
              </View>

              <TouchableOpacity 
                style={[StylesCommuns.boutonVert, styles.shadowBouton, {marginTop: 35}]} 
                onPress={gererEnvoiCode}
                disabled={chargement}
              >
                {chargement ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={StylesCommuns.texteBouton}>Envoyer le code</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* --- ETAPE 2 : VALIDATION ET NOUVEAU MDP --- */}
          {etape === 2 && (
            <View>
              <Text style={StylesCommuns.label}>Code de verification (OTP)</Text>
              <View style={styles.inputStyle}>
                <MaterialCommunityIcons name="shield-check-outline" size={20} color={Couleurs.vertAgentrix} style={styles.icon} />
                <TextInput 
                  style={StylesCommuns.inputText} 
                  placeholder="Code a 6 chiffres" 
                  keyboardType="number-pad"
                  value={codeOTP}
                  onChangeText={setCodeOTP}
                  maxLength={6}
                  editable={!chargement}
                />
              </View>

              <Text style={StylesCommuns.label}>Nouveau mot de passe</Text>
              <View style={styles.inputStyle}>
                <MaterialCommunityIcons name="lock-outline" size={20} color={Couleurs.vertAgentrix} style={styles.icon} />
                <TextInput 
                  style={StylesCommuns.inputText} 
                  placeholder="........" 
                  secureTextEntry={!voirPasse}
                  value={nouveauPasse}
                  onChangeText={setNouveauPasse}
                  editable={!chargement}
                />
                <TouchableOpacity onPress={() => setVoirPasse(!voirPasse)} disabled={chargement}>
                  <MaterialCommunityIcons 
                    name={voirPasse ? "eye-off-outline" : "eye-outline"} 
                    size={20} color={Couleurs.texteGris} 
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity 
                style={[StylesCommuns.boutonVert, styles.shadowBouton, {marginTop: 35}]} 
                onPress={gererReinitialisation}
                disabled={chargement}
              >
                {chargement ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={StylesCommuns.texteBouton}>Valider le changement</Text>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity onPress={
                async () =>{
                  try {
                    console.log("[RETRY] Demande de renvoi du code OTP...");
                    const response = await AuthService.forgotPassword(telephone);
                    console.log("[SERVER_RESPONSE] Resend OTP :", JSON.stringify(response, null, 2));
          
                    if (response.success) {
                      console.log("[OTP_RESENT] Nouveau code envoye avec succes.");
                    } else {
                      Alert.alert("Erreur", response.message || "Impossible de renvoyer le code.");
                    }
                  } catch (error) {
                    console.error("[API_ERROR] Echec lors du renvoi :", error);
                    Alert.alert("Erreur reseau", error.message || "Verifiez votre connexion.");
                  } finally {
                    setChargement(false);
                  }
                }
              } style={styles.resendBtn} disabled={chargement}>
                  <Text style={styles.resendTxt}>Renvoyer le code</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={{height: 40}} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  cercleDeco1: { position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: 100, backgroundColor: '#49975174', opacity: 0.4 },
  cercleDeco2: { position: 'absolute', bottom: 0, left: -55, width: 140, height: 140, borderRadius: 80, backgroundColor: '#2c7a345e', opacity: 0.6 },
  cercleDeco3: { position: 'absolute', top: 250, right: -20, width: 60, height: 60, borderRadius: 30, backgroundColor: '#4997516b', opacity: 0.3 },
  headerTexte: { marginTop: 20, marginBottom: 30 },
  barreAccents: { width: 40, height: 5, backgroundColor: Couleurs.vertAgentrix, borderRadius: 10, marginTop: 8 },
  inputStyle: { ...StylesCommuns.inputContainer, backgroundColor: 'rgba(255, 255, 255, 0.85)', borderColor: '#E5E7EB' },
  backBtn: { marginTop: 30, marginBottom: 10, width: 40, height: 40, justifyContent: 'center' },
  icon: { marginRight: 12 },
  flag: { width: 24, height: 16, marginRight: 8 },
  prefix: { fontSize: 16, fontWeight: '600', marginRight: 10, color: Couleurs.texteNoir },
  resendBtn: { marginTop: 25, alignItems: 'center' },
  resendTxt: { color: Couleurs.texteGris, fontSize: 15, fontWeight: '500' },
  shadowBouton: {
    shadowColor: Couleurs.vertAgentrix,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  }
});

export default OublieMdpScreen;