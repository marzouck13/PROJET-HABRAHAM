// src/screens/TransfertScreen.js
import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity, 
  TextInput, ScrollView, KeyboardAvoidingView, Platform, NativeModules, 
  PermissionsAndroid, Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StylesCommuns, Couleurs } from '../styles/ThemeAgentrix';
import { obtenirReseauxDisponibles, genererCodeTransfert } from '../services/ussd/UssdLibrary';
import SelecteurReseau from '../components/transfert/SelecteurReseau';
import ChampNumero from '../components/transfert/ChampNumero';
import ChampMotif from '../components/transfert/ChampMotif';
import ChampMontant from '../components/transfert/ChampMontant';
import RecapTransfert from '../components/transfert/RecapTransfert';
import ModalConfirmation from '../components/transfert/ModalConfirmation';
import ModalContacts from '../components/transfert/ModalContacts';
import ReponseUssd from '../components/transfert/ReponseUssd';
import HistoriqueUssd from '../components/transfert/HistoriqueUssd';

const MomoAutomationModule = NativeModules.MomoAutomationModule;

export default function TransfertScreen({ setAppState }) {
  const [reseaux, setReseaux] = useState([]);
  const [reseauActif, setReseauActif] = useState(null);
  const [numero, setNumero] = useState('');
  const [motif, setMotif] = useState('');
  const [montant, setMontant] = useState('');
  const [ussdReponse, setUssdReponse] = useState('');
  const [chargement, setChargement] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalContacts, setModalContacts] = useState(false);
  const [historique, setHistorique] = useState([]);
  const [numerosEnregistres, setNumerosEnregistres] = useState([]);

  useEffect(() => { chargerNumeros(); }, []);

  const chargerNumeros = async () => {
    try {
      const data = await AsyncStorage.getItem('@agentrix_numbers');
      if (data) {
        const parsed = JSON.parse(data);
        const liste = Array.isArray(parsed) ? parsed : [parsed];
        setNumerosEnregistres(liste);
        const r = obtenirReseauxDisponibles(liste);
        setReseaux(r);
        if (r.length > 0) setReseauActif(r[0]);
      }
    } catch (e) {}
  };

  const demanderPermissions = async () => {
    if (Platform.OS !== 'android') return true;
    const call = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CALL_PHONE);
    const phone = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE);
    return call === 'granted' && phone === 'granted';
  };

  const validerEtConfirmer = () => {
    if (!numero || !montant) {
      return Alert.alert('Champs vides', 'Renseignez un numero et un montant.');
    }
    setModalVisible(true);
  };

  const executer = async () => {
    setModalVisible(false);
    const code = genererCodeTransfert(reseauActif, numero, montant, motif);
    if (!(await demanderPermissions())) return Alert.alert('Permissions', 'Autorisez les permissions.');
    if (!MomoAutomationModule?.sendUssd) return setUssdReponse('Module introuvable.');

    setChargement(true);
    setUssdReponse('Envoi en cours...');
    try {
      const rep = await MomoAutomationModule.sendUssd(code);
      setUssdReponse(rep || 'OK');
      setHistorique(prev => [{ id: Date.now().toString(), code, reponse: rep || 'OK', date: new Date().toISOString() }, ...prev]);
      setNumero(''); setMotif(''); setMontant('');
    } catch (e) {
      setUssdReponse('Echec : ' + e.message);
    } finally {
      setChargement(false);
    }
  };

  return (
    <SafeAreaView style={StylesCommuns.conteneur}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.titre}>Transfert Agent</Text>

          <Text style={styles.label}>Reseau</Text>
          <SelecteurReseau reseauxDisponibles={reseaux} selectionne={reseauActif} onSelect={setReseauActif} />

          <Text style={styles.label}>Numero beneficiaire</Text>
          <ChampNumero value={numero} onChangeText={setNumero} onPressContacts={() => setModalContacts(true)} />

          <Text style={styles.label}>Motif</Text>
          <ChampMotif value={motif} onChangeText={setMotif} />

          <Text style={styles.label}>Montant</Text>
          <ChampMontant value={montant} onChangeText={(t) => setMontant(t.replace(/[^0-9]/g, ''))} onSelectRapide={(v) => setMontant(v.toString())} />

          <RecapTransfert montant={montant} />

          <TouchableOpacity style={styles.btn} onPress={validerEtConfirmer}>
            <MaterialCommunityIcons name="send-circle" size={24} color="#FFF" style={{ marginRight: 8 }} />
            <Text style={styles.btnTexte}>Envoyer le transfert</Text>
          </TouchableOpacity>

          <ReponseUssd reponse={ussdReponse} chargement={chargement} />
          <HistoriqueUssd historique={historique} />

          <TouchableOpacity style={styles.btnRetour} onPress={() => setAppState?.('PILOTE1')}>
            <MaterialCommunityIcons name="home" size={24} color={Couleurs.vertAgentrix} style={{ marginRight: 8 }} />
            <Text style={styles.btnRetourTexte}>Retour</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      <ModalConfirmation
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onConfirm={executer}
        operateur={reseauActif}
        numero={numero}
        motif={motif}
        montant={montant}
      />
      <ModalContacts
        visible={modalContacts}
        onClose={() => setModalContacts(false)}
        numerosEnregistres={numerosEnregistres}
        onSelect={setNumero}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 16, paddingTop: 65, paddingBottom: 40 },
  titre: { fontSize: 24, fontWeight: '800', color: Couleurs.texteNoir, marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '700', color: Couleurs.texteNoir, marginBottom: 8, marginTop: 15 },
  btn: { backgroundColor: '#0c803ef7', borderRadius: 12, height: 54, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 15 },
  btnTexte: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  btnRetour: { backgroundColor: '#FFF', borderRadius: 12, height: 54, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: Couleurs.vertAgentrix, marginTop: 20 },
  btnRetourTexte: { color: Couleurs.vertAgentrix, fontSize: 16, fontWeight: '700' },
});