import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Image, ActivityIndicator, StatusBar } from 'react-native';
import { Couleurs } from '../styles/ThemeAgentrix';

const EcranChargement = () => {
  const pulseAnim = useRef(new Animated.Value(0.4)).current; // Commence à 0.4 d'opacité

  useEffect(() => {
    // Création de l'animation en boucle (Pulse)
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.4,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Animated.View style={{ opacity: pulseAnim, alignItems: 'center' }}>
        <Image 
          source={require('../../assets/images/logo_principale.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
        {/* L'ActivityIndicator est à l'intérieur du View animé pour pulser avec le logo */}
        <ActivityIndicator size={70} color={Couleurs.vertAgentrix} style={{ marginTop: 30 }} />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#FFFFFF', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  logo: { width: 280, height: 280 }
});

export default EcranChargement;