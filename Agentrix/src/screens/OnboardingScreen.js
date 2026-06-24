import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Dimensions,
  Alert,
  ActivityIndicator,
  Platform,
  Linking,
} from 'react-native';
import { StylesCommuns, Couleurs } from '../styles/ThemeAgentrix';
import { isUssdAvailable } from '../utils/deviceChecks';
import { ussdService } from '../services/ussd';

const { width } = Dimensions.get('window');

const DATA_ONBOARDING = [
  { id: '1', titre: 'Bienvenue sur Agentrix', desc: 'Découvrez la plateforme ultra-rapide...', img: require('../../assets/images/logo_principale.png') },
  { id: '2', titre: 'Tous vos Réseaux ici', desc: 'Dites adieu au jonglage...', img: require('../../assets/images/telphone.png') },
  { id: '3', titre: "Un seul coup d'œil suffit", desc: 'Gardez un contrôle total...', img: require('../../assets/images/state.png') },
  { id: '4', titre: 'Trouvez de la Liquidité', desc: 'Ne soyez plus jamais à court...', img: require('../../assets/images/localise.png') },
  { id: '5', titre: 'Sécurité Maximale', desc: 'Opérez en toute tranquillité...', img: require('../../assets/images/sérure.png') },
  { id: '6', titre: "Une question ? L'IA répond", desc: 'Bénéficiez d\'un assistant IA...', img: require('../../assets/images/ia.png') },
  { id: '7', titre: 'Prêt à commencer ?', desc: 'Rejoignez la communauté...', img: require('../../assets/images/logo_principale.png') },
  {
    id: '8',
    titre: '⚙️ Activation (optionnelle)',
    desc: 'Vous pouvez activer l\'automatisation pour tester, mais ce n\'est pas obligatoire pour naviguer dans l\'application.',
    img: require('../../assets/images/telphone.png'),
  },
];

const OnboardingScreen = ({ auAllerConnexion, auAllerInscription }) => {
  const [indexActuel, setIndexActuel] = useState(0);
  const [isActivating, setIsActivating] = useState(false);
  const [serviceActive, setServiceActive] = useState(false);
  const flatListRef = useRef(null);

  const gererSuivant = () => {
    if (indexActuel < DATA_ONBOARDING.length - 1) {
      flatListRef.current.scrollToIndex({ index: indexActuel + 1 });
    }
  };

  const activerService = async () => {
    if (Platform.OS !== 'android') {
      Alert.alert('Non supporté', 'Cette fonctionnalité est Android uniquement.');
      return;
    }

    if (!isUssdAvailable()) {
      Alert.alert('Module indisponible', 'Le module n\'est pas disponible sur cet appareil.');
      return;
    }

    setIsActivating(true);

    try {
      await ussdService.initialize();

      Alert.alert(
        '🔔 Activation du service',
        '1. Appuyez sur "Ouvrir paramètres"\n' +
        '2. Cherchez "Services installés" ou "Notification"\n' +
        '3. Activez "Agentrix"\n' +
        '4. Revenez dans l\'application',
        [
          {
            text: 'Ouvrir paramètres',
            onPress: async () => {
              await Linking.openSettings();
              Alert.alert(
                '✅ Vérification',
                'Avez-vous activé le service ?',
                [
                  {
                    text: 'Oui, c\'est fait',
                    onPress: () => {
                      setServiceActive(true);
                      Alert.alert('🎉 Parfait !', 'L\'automatisation est active.');
                    },
                  },
                  { text: 'Non, plus tard', style: 'cancel' },
                ],
                { cancelable: true }
              );
            },
          },
          { text: 'Annuler', style: 'cancel' },
        ],
        { cancelable: true }
      );
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'activer le service.');
    } finally {
      setIsActivating(false);
    }
  };

  const estDerniereDiapo = indexActuel === DATA_ONBOARDING.length - 1;

  // Pas de condition sur serviceActive : on navigue toujours
  const gererActionFinale = () => {
    auAllerInscription(); // ou auAllerConnexion selon le flux souhaité
  };

  const RenderItem = ({ item, index }) => {
    const isLastSlide = index === DATA_ONBOARDING.length - 1;

    return (
      <View style={styles.slide}>
        <View style={styles.imageBox}>
          <Image source={item.img} style={styles.logo} resizeMode="contain" />
        </View>

        <View style={styles.cardContainer}>
          <Text style={[StylesCommuns.grandTitre, styles.titreOriginal]}>
            {item.titre}
          </Text>
          <Text style={[StylesCommuns.sousTitre, styles.descriptionDetaillee]}>
            {item.desc}
          </Text>

          {isLastSlide && (
            <>
              <TouchableOpacity
                style={styles.boutonActivation}
                onPress={activerService}
                disabled={isActivating}
              >
                {isActivating ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.boutonActivationTexte}>
                    {serviceActive ? ' Service activé' : ' Activer (optionnel)'}
                  </Text>
                )}
              </TouchableOpacity>

              {serviceActive && (
                <Text style={styles.messageOk}>✔ Service actif</Text>
              )}
            </>
          )}
        </View>

        {isLastSlide && serviceActive && (
          <View style={styles.badgeActive}>
            <Text style={styles.badgeTexte}>✓ Prêt</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={[StylesCommuns.conteneur, { overflow: 'hidden' }]}>
      {/* Cercles décoratifs */}
      <View style={styles.cercleDeco1} />
      <View style={styles.cercleDeco2} />
      <View style={styles.cercleDeco3} />

      <FlatList
        ref={flatListRef}
        data={DATA_ONBOARDING}
        renderItem={({ item, index }) => <RenderItem item={item} index={index} />}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const newIndex = Math.round(e.nativeEvent.contentOffset.x / width);
          setIndexActuel(newIndex);
        }}
        keyExtractor={(item) => item.id}
      />

      <View style={styles.pagination}>
        {DATA_ONBOARDING.map((_, i) => (
          <View
            key={i}
            style={[
              styles.point,
              {
                backgroundColor: i === indexActuel ? Couleurs.vertAgentrix : '#D1D5DB',
                width: i === indexActuel ? 20 : 8,
              },
            ]}
          />
        ))}
      </View>

      <View style={styles.buttonBox}>
        {!estDerniereDiapo ? (
          <TouchableOpacity style={StylesCommuns.boutonVert} onPress={gererSuivant}>
            <Text style={StylesCommuns.texteBouton}>Suivant</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.boutonsFinaux}>
            <TouchableOpacity
              style={[StylesCommuns.boutonVert, styles.boutonPrincipal]}
              onPress={gererActionFinale}
            >
              <Text style={StylesCommuns.texteBouton}>Créer un compte</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.boutonSecondaire}
              onPress={auAllerConnexion}
            >
              <Text style={styles.boutonSecondaireTexte}>J'ai déjà un compte</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

// ------ Styles (incluant tous les styles existants) ------
const styles = StyleSheet.create({
  slide: { width: width, flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  imageBox: { flex: 1.8, justifyContent: 'center', alignItems: 'center' },
  logo: { width: 330, height: 300, right: -10 },
  cercleDeco1: { position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: 100, backgroundColor: '#4997513a', zIndex: -1 },
  cercleDeco2: { position: 'absolute', bottom: 150, left: -50, width: 140, height: 140, borderRadius: 70, backgroundColor: '#2c7a3422', zIndex: -1 },
  cercleDeco3: { position: 'absolute', top: '30%', left: -30, width: 60, height: 60, borderRadius: 30, backgroundColor: '#4997511c', zIndex: -1 },
  cardContainer: { flex: 1.2, width: '100%', backgroundColor: 'rgba(255,255,255,0.33)', borderRadius: 10, padding: 20, borderWidth: 1, borderColor: Couleurs.vertAgentrix + '30', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, justifyContent: 'center', marginBottom: 50 },
  titreOriginal: { textAlign: 'center', fontSize: 22, color: Couleurs.texteNoir, marginBottom: 12 },
  descriptionDetaillee: { textAlign: 'center', fontSize: 15, lineHeight: 22, color: Couleurs.texteGris, paddingHorizontal: 10 },
  boutonActivation: { backgroundColor: Couleurs.vertAgentrix, padding: 12, borderRadius: 8, marginTop: 15, alignItems: 'center' },
  boutonActivationTexte: { color: 'white', fontSize: 14, fontWeight: '600' },
  badgeActive: { position: 'absolute', top: 10, right: 10, backgroundColor: '#4CAF50', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 15 },
  badgeTexte: { color: 'white', fontSize: 12, fontWeight: 'bold' },
  pagination: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  point: { height: 8, borderRadius: 4, marginHorizontal: 4 },
  buttonBox: { paddingHorizontal: 25, paddingBottom: 30, height: 100, justifyContent: 'center' },
  boutonsFinaux: { width: '100%' },
  boutonPrincipal: { marginBottom: 10 },
  boutonSecondaire: { padding: 12, alignItems: 'center' },
  boutonSecondaireTexte: { color: Couleurs.vertAgentrix, fontSize: 16, fontWeight: '500' },
  messageOk: { textAlign: 'center', color: '#0d9488', fontWeight: 'bold', marginTop: 8 },
});

export default OnboardingScreen;