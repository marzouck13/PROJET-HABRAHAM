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
} from 'react-native';
import { StylesCommuns, Couleurs } from '../styles/ThemeAgentrix';

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
];

const OnboardingScreen = ({ auAllerConnexion, auAllerInscription }) => {
  const [indexActuel, setIndexActuel] = useState(0);
  const flatListRef = useRef(null);

  const gererSuivant = () => {
    if (indexActuel < DATA_ONBOARDING.length - 1) {
      flatListRef.current.scrollToIndex({ index: indexActuel + 1 });
    }
  };

  const RenderItem = ({ item }) => (
    <View style={styles.slide}>
      <View style={styles.imageBox}>
        <Image source={item.img} style={styles.logo} resizeMode="contain" />
      </View>
      
      {/* Carte contenant le Titre et la Description */}
      <View style={styles.cardContainer}>
        <Text style={[StylesCommuns.grandTitre, styles.titreOriginal]}>
          {item.titre}
        </Text>
        <Text style={[StylesCommuns.sousTitre, styles.descriptionDetaillee]}>
          {item.desc}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[StylesCommuns.conteneur, { overflow: 'hidden' }]}>
      
      {/* --- ÉLÉMENTS DE DÉCORATION EN ARRIÈRE-PLAN --- */}
      <View style={styles.cercleDeco1} />
      <View style={styles.cercleDeco2} />
      <View style={styles.cercleDeco3} />

      <FlatList
        ref={flatListRef}
        data={DATA_ONBOARDING}
        renderItem={({ item }) => <RenderItem item={item} />}
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
            style={[styles.point, { backgroundColor: i === indexActuel ? Couleurs.vertAgentrix : '#D1D5DB', width: i === indexActuel ? 20 : 8 }]} 
          />
        ))}
      </View>

      <View style={styles.buttonBox}>
        {indexActuel < DATA_ONBOARDING.length - 1 ? (
          <TouchableOpacity style={StylesCommuns.boutonVert} onPress={gererSuivant}>
            <Text style={StylesCommuns.texteBouton}>Suivant</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={StylesCommuns.boutonVert} onPress={auAllerInscription}>
            <Text style={StylesCommuns.texteBouton}>Créer un compte</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  slide: { width: width, flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  imageBox: { flex: 1.8, justifyContent: 'center', alignItems: 'center' },
  logo: { width: 330, height: 300,right:-10 },
  
  // Styles des cercles de décoration (zIndex -1 pour rester derrière)
  cercleDeco1: { position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: 100, backgroundColor: '#4997513a', zIndex: -1 },
  cercleDeco2: { position: 'absolute', bottom: 150, left: -50, width: 140, height: 140, borderRadius: 70, backgroundColor: '#2c7a3422', zIndex: -1 },
  cercleDeco3: { position: 'absolute', top: '30%', left: -30, width: 60, height: 60, borderRadius: 30, backgroundColor: '#4997511c', zIndex: -1 },

  cardContainer: {
    flex: 1.2,
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.33)', // Légère transparence pour voir la déco
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

  pagination: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  point: { height: 8, borderRadius: 4, marginHorizontal: 4 },
  buttonBox: { paddingHorizontal: 25, paddingBottom: 30, height: 100, justifyContent: 'center' },
});

export default OnboardingScreen;