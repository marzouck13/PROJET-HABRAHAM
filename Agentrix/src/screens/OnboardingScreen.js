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
} from 'react-native';
import { StylesCommuns, Couleurs } from '../styles/ThemeAgentrix';
import { isUssdAvailable } from '../utils/deviceChecks';
import { ussdService } from '../services/ussd';

const { width } = Dimensions.get('window');

const DATA_ONBOARDING = [
  { 
    id: '1', 
    titre: 'Bienvenue sur Agentrix', 
    desc: 'Découvrez la plateforme ultra-rapide qui unifie vos services de Mobile Money au Bénin. Gérez tous vos flux financiers depuis une interface unique et intuitive conçue pour votre performance.', 
    img: require('../../assets/images/logo_principale.png') 
  },
  { 
    id: '2', 
    titre: 'Tous vos Réseaux ici', 
    desc: 'Dites adieu au jonglage entre plusieurs téléphones. Centralisez vos comptes MTN, Moov et Celtis pour une gestion fluide et sans interruption de vos services de transfert.', 
    img: require('../../assets/images/telphone.png') 
  },
  { 
    id: '3', 
    titre: "Un seul coup d'œil suffit", 
    desc: 'Gardez un contrôle total sur votre activité. Visualisez votre cash disponible, vos stocks de crédits et vos commissions générées en temps réel sur un tableau de bord transparent.', 
    img: require('../../assets/images/state.png') 
  },
  { 
    id: '4', 
    titre: 'Trouvez de la Liquidité', 
    desc: 'Ne soyez plus jamais à court de liquidité. Notre système de géolocalisation vous connecte instantanément aux agents rechargeurs les plus proches pour approvisionner votre stock.', 
    img: require('../../assets/images/localise.png') 
  },
  { 
    id: '5', 
    titre: 'Sécurité Maximale', 
    desc: 'Opérez en toute tranquillité. Vos revenus et les données de vos clients bénéficient d\'un chiffrement de niveau bancaire, garantissant une protection absolue de chaque transaction.', 
    img: require('../../assets/images/sérure.png') 
  },
  { 
    id: '6', 
    titre: "Une question ? L'IA répond", 
    desc: 'Bénéficiez d\'un assistant IA dédié pour répondre à vos questions complexes : calculs de commissions, grilles tarifaires ou résolution rapide des incidents techniques.', 
    img: require('../../assets/images/ia.png') 
  },
  { 
    id: '7', 
    titre: 'Prêt à commencer ?', 
    desc: 'Rejoignez la communauté des agents modernes et transformez votre point de vente. Le futur des services financiers commence ici avec Agentrix.', 
    img: require('../../assets/images/logo_principale.png') 
  },
  { 
    id: '8', 
    titre: '⚙️ Activez l\'Automatisation', 
    desc: 'Pour profiter pleinement d\'Agentrix, activez le service d\'automatisation. Cela nous permettra de traiter vos transactions Mobile Money instantanément, sans intervention manuelle.', 
    img: require('../../assets/images/telphone.png') 
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

  // Fonction pour ouvrir les paramètres de notification Android
  const activerServiceNotification = async () => {
    if (Platform.OS !== 'android') {
      Alert.alert(
        'Non supporté',
        'Cette fonctionnalité est disponible uniquement sur Android.'
      );
      return;
    }

    setIsActivating(true);

    try {
      // Vérifier si le module natif est disponible
      if (!isUssdAvailable()) {
        Alert.alert(
          'Module non disponible',
          'Le module d\'automatisation n\'est pas disponible sur cet appareil. Vous pourrez utiliser les fonctionnalités de base.',
          [{ text: 'Compris' }]
        );
        setServiceActive(false);
        return;
      }

      // Initialiser le service
      await ussdService.initialize();
      
      // Guider l'utilisateur
      Alert.alert(
        '🔔 Activez le service',
        'Pour permettre à Agentrix de traiter vos transactions automatiquement :\n\n' +
        '1. Appuyez sur "Ouvrir paramètres"\n' +
        '2. Cherchez "Services installés" ou "Notification"\n' +
        '3. Activez "Agentrix"\n' +
        '4. Revenez dans l\'application',
        [
          { text: 'Annuler', style: 'cancel' },
          { 
            text: 'Ouvrir paramètres', 
            onPress: async () => {
              try {
                // Ouvrir les paramètres Android
                const { Linking } = require('react-native');
                await Linking.openSettings();
                
                // Après retour, vérifier l'activation
                setTimeout(() => {
                  Alert.alert(
                    '✅ Vérification',
                    'Avez-vous activé le service ?',
                    [
                      { 
                        text: 'Oui, c\'est fait', 
                        onPress: () => {
                          setServiceActive(true);
                          Alert.alert(
                            '🎉 Parfait !',
                            'L\'automatisation est maintenant active. Vous pouvez profiter de toutes les fonctionnalités d\'Agentrix.'
                          );
                        }
                      },
                      { 
                        text: 'Non, plus tard',
                        style: 'cancel',
                        onPress: () => {
                          Alert.alert(
                            '⏰ Pas de souci',
                            'Vous pourrez activer cette fonctionnalité plus tard dans les paramètres de l\'application.'
                          );
                        }
                      }
                    ]
                  );
                }, 1000);
              } catch (error) {
                Alert.alert('Erreur', 'Impossible d\'ouvrir les paramètres.');
              }
            }
          }
        ]
      );
      
    } catch (error) {
      console.error('Erreur activation:', error);
      Alert.alert(
        'Erreur',
        'Une erreur est survenue lors de l\'activation. Vous pourrez réessayer plus tard.'
      );
    } finally {
      setIsActivating(false);
    }
  };

  const gererActionFinale = () => {
    // Si c'est la dernière diapositive (étape d'activation)
    if (indexActuel === DATA_ONBOARDING.length - 1) {
      if (!serviceActive && isUssdAvailable()) {
        // Montrer l'alerte d'activation avant de continuer
        Alert.alert(
          '⚡ Fonctionnalité Premium',
          'Voulez-vous activer l\'automatisation maintenant ? Cela vous permettra de traiter les transactions 10x plus rapidement.',
          [
            { 
              text: 'Activer maintenant', 
              onPress: activerServiceNotification 
            },
            { 
              text: 'Plus tard', 
              onPress: auAllerInscription 
            }
          ]
        );
      } else {
        auAllerInscription();
      }
    }
  };

  const RenderItem = ({ item, index }) => {
    // Vérifier si c'est la dernière diapositive (étape d'activation)
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

          {/* Afficher le bouton d'activation uniquement sur la dernière diapositive */}
          {isLastSlide && (
            <TouchableOpacity 
              style={styles.boutonActivation}
              onPress={activerServiceNotification}
              disabled={isActivating}
            >
              {isActivating ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.boutonActivationTexte}>
                  {serviceActive ? '✅ Service Activé' : '🔔 Activer l\'Automatisation'}
                </Text>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Badge si service déjà activé */}
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
      
      {/* --- ÉLÉMENTS DE DÉCORATION EN ARRIÈRE-PLAN --- */}
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
                width: i === indexActuel ? 20 : 8 
              }
            ]} 
          />
        ))}
      </View>

      <View style={styles.buttonBox}>
        {indexActuel < DATA_ONBOARDING.length - 1 ? (
          <TouchableOpacity style={StylesCommuns.boutonVert} onPress={gererSuivant}>
            <Text style={StylesCommuns.texteBouton}>Suivant</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.boutonsFinaux}>
            <TouchableOpacity 
              style={[StylesCommuns.boutonVert, styles.boutonPrincipal]} 
              onPress={gererActionFinale}
            >
              <Text style={StylesCommuns.texteBouton}>
                {serviceActive ? 'Créer un compte' : 'Continuer'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.boutonSecondaire} 
              onPress={auAllerConnexion}
            >
              <Text style={styles.boutonSecondaireTexte}>
                J'ai déjà un compte
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  slide: { 
    width: width, 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingHorizontal: 20 
  },
  imageBox: { 
    flex: 1.8, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  logo: { 
    width: 330, 
    height: 300,
    right: -10 
  },
  
  // Cercles de décoration
  cercleDeco1: { 
    position: 'absolute', 
    top: -50, 
    right: -50, 
    width: 200, 
    height: 200, 
    borderRadius: 100, 
    backgroundColor: '#4997513a', 
    zIndex: -1 
  },
  cercleDeco2: { 
    position: 'absolute', 
    bottom: 150, 
    left: -50, 
    width: 140, 
    height: 140, 
    borderRadius: 70, 
    backgroundColor: '#2c7a3422', 
    zIndex: -1 
  },
  cercleDeco3: { 
    position: 'absolute', 
    top: '30%', 
    left: -30, 
    width: 60, 
    height: 60, 
    borderRadius: 30, 
    backgroundColor: '#4997511c', 
    zIndex: -1 
  },

  cardContainer: {
    flex: 1.2,
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.33)',
    borderRadius: 10,
    padding: 20,
    borderWidth: 1,
    borderColor: Couleurs.vertAgentrix + '30', 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    justifyContent: 'center',
    marginBottom: 50,
  },
  titreOriginal: { 
    textAlign: 'center', 
    fontSize: 22, 
    color: Couleurs.texteNoir,
    marginBottom: 12 
  },
  descriptionDetaillee: { 
    textAlign: 'center', 
    fontSize: 15, 
    lineHeight: 22,
    color: Couleurs.texteGris,
    paddingHorizontal: 10
  },

  // Bouton d'activation
  boutonActivation: {
    backgroundColor: Couleurs.vertAgentrix,
    padding: 12,
    borderRadius: 8,
    marginTop: 15,
    alignItems: 'center',
  },
  boutonActivationTexte: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },

  // Badge "Prêt"
  badgeActive: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  badgeTexte: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },

  pagination: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 20 
  },
  point: { 
    height: 8, 
    borderRadius: 4, 
    marginHorizontal: 4 
  },
  buttonBox: { 
    paddingHorizontal: 25, 
    paddingBottom: 30, 
    height: 100, 
    justifyContent: 'center' 
  },
  
  // Boutons finaux
  boutonsFinaux: {
    width: '100%',
  },
  boutonPrincipal: {
    marginBottom: 10,
  },
  boutonSecondaire: {
    padding: 12,
    alignItems: 'center',
  },
  boutonSecondaireTexte: {
    color: Couleurs.vertAgentrix,
    fontSize: 16,
    fontWeight: '500',
  },
});

export default OnboardingScreen;