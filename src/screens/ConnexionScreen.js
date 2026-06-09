import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, Image, StyleSheet, 
  ScrollView, SafeAreaView, ActivityIndicator, KeyboardAvoidingView, 
  Platform, StatusBar, Alert 
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StylesCommuns, Couleurs } from '../styles/ThemeAgentrix';

import { AuthService } from '../services/AgentrixApi';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ConnexionScreen = ({ auInscription, auRetour, auOublieMdp, auSuccesConnexion }) => {
  const [telephone, setTelephone] = useState('');
  const [passe, setPasse] = useState('');
  const [voirPasse, setVoirPasse] = useState(false);
  const [chargement, setChargement] = useState(false);

  const gererConnexion = async () => {
    if (!telephone.trim() || !passe.trim()) {
      Alert.alert("Champs requis", "Veuillez renseigner votre numéro et votre mot de passe.");
      return;
    }

    if (telephone.trim().length !== 10) {
      Alert.alert("Numéro invalide", "Le numéro de téléphone doit comporter exactement 10 chiffres.");
      return;
    }

    setChargement(true);
    console.log("🚀 [LOG] Tentative de connexion...");

    try {
      const response = await AuthService.login(telephone, passe);
      console.log("📥 [LOG] Réponse reçue :", JSON.stringify(response, null, 2));

      if (response.success) {
        const { tokens, userId } = response.data[0];
        
        await AsyncStorage.setItem('userToken', tokens.accessToken);
        await AsyncStorage.setItem('refreshToken', tokens.refreshToken);
        await AsyncStorage.setItem('userId', userId);

        console.log("💾 [LOG] Connexion réussie pour l'ID :", userId);
        if (auSuccesConnexion) auSuccesConnexion();
      } else {
        // --- LOGIQUE DE FALLBACK ICI ---
        // On vérifie si le message du serveur indique que le compte n'existe pas
        const msg = response.message.toLowerCase();
        
        if (msg.includes("non trouvé") || msg.includes("n'existe pas") || msg.includes("not found")) {
          console.warn("⚠️ [LOG] Compte inexistant détecté.");
          
          Alert.alert(
            "Compte introuvable",
            "Ce numéro n'est pas encore inscrit sur Agentrix. Souhaitez-vous créer un compte ?",
            [
              { text: "Réessayer", style: "cancel" },
              { text: "Créer un compte", onPress: () => auInscription(), style: "default" }
            ]
          );
        } else {
          Alert.alert("Erreur", response.message);
        }
      }

    } catch (error) {
      console.error("❌ [LOG] Erreur API :");
      Alert.alert("Erreur de connexion", error.message || "Serveur injoignable.");
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
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 25, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity onPress={auRetour} style={styles.backBtn} disabled={chargement}>
            <MaterialCommunityIcons name="arrow-left" size={28} color={Couleurs.texteNoir} />
          </TouchableOpacity>
          
          <View style={styles.headerTexte}>
            <Text style={StylesCommuns.grandTitre}>Connexion</Text>
            <View style={styles.barreAccents} />
            <Text style={[StylesCommuns.sousTitre, { marginTop: 10 }]}>
              Heureux de vous revoir ! Entrez vos accès.
            </Text>
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
            <MaterialCommunityIcons name="lock-outline" size={20} color={Couleurs.vertAgentrix} style={{marginRight: 12}} />
            <TextInput 
              style={StylesCommuns.inputText} 
              placeholder="••••••••" 
              secureTextEntry={!voirPasse}
              value={passe}
              onChangeText={setPasse}
              editable={!chargement}
            />
            <TouchableOpacity onPress={() => setVoirPasse(!voirPasse)}>
              <MaterialCommunityIcons 
                name={voirPasse ? "eye-off-outline" : "eye-outline"} 
                size={20} 
                color={Couleurs.texteGris} 
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.forgotBtn} onPress={auOublieMdp} disabled={chargement}>
            <Text style={styles.forgotTxt}>Mot de passe oublié ?</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[StylesCommuns.boutonVert, styles.shadowBouton, chargement && { opacity: 0.8 }]} 
            onPress={gererConnexion}
            disabled={chargement}
          >
            {chargement ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={StylesCommuns.texteBouton}>Se connecter</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.footer} onPress={auInscription} disabled={chargement}>
            <Text style={styles.footerTxt}>
              Nouveau ici ? <Text style={{color: Couleurs.vertAgentrix, fontWeight: '700'}}>S'inscrire</Text>
            </Text>
          </TouchableOpacity>
          
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  cercleDeco1: { position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: 100, backgroundColor: '#49975140', zIndex: -1 },
  cercleDeco2: { position: 'absolute', bottom: -50, left: -50, width: 140, height: 140, borderRadius: 70, backgroundColor: '#2c7a343c', zIndex: -1 },
  cercleDeco3: { position: 'absolute', top: '35%', right: -30, width: 60, height: 60, borderRadius: 30, backgroundColor: '#49975134', zIndex: -1 },
  backBtn: { marginTop: Platform.OS === 'android' ? 50 : 30, marginBottom: 10, width: 40, height: 40, justifyContent: 'center' },
  headerTexte: { marginTop: 10, marginBottom: 20 },
  barreAccents: { width: 40, height: 5, backgroundColor: Couleurs.vertAgentrix, borderRadius: 10, marginTop: 8 },
  inputStyle: { ...StylesCommuns.inputContainer, backgroundColor: '#F9FAFB', borderColor: '#F3F4F6' },
  flag: { width: 24, height: 16, marginRight: 8 },
  prefix: { fontSize: 16, fontWeight: '700', marginRight: 10, color: '#000' },
  forgotBtn: { alignSelf: 'flex-end', marginTop: 10, marginBottom: 25, paddingVertical: 5 },
  forgotTxt: { color: Couleurs.texteGris, fontSize: 14, fontWeight: '500' },
  footer: { marginTop: 20, alignItems: 'center' },
  footerTxt: { color: Couleurs.texteGris, fontSize: 15, fontWeight: '500' },
  shadowBouton: { elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3 }
});

export default ConnexionScreen;