import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import EcranChargement from './src/components/EcranChargement';
import OnboardingScreen from './src/screens/OnboardingScreen';
import ConnexionScreen from './src/screens/ConnexionScreen';
import InscriptionScreen from './src/screens/InscriptionScreen';
import OublieMdpScreen from './src/screens/OublieMdpScreen';
import Pilote1Screen from './src/screens/Pilote1Screen';

export default function App() {
  const [etatApp, setEtatApp] = useState('CHARGEMENT'); // Remplacer par PILOTE1 écrit en grand carractères

  useEffect(() => {
    verifierFluxUtilisateur();
  }, []);

  const verifierFluxUtilisateur = async () => {
    try {
       await AsyncStorage.clear(); // Utile pour tester l'onboarding à nouveau en dev
      
      const dejaVisite = await AsyncStorage.getItem('@deja_visite');
      
      setTimeout(() => {
        // Si dejaVisite existe et vaut 'true', on va direct à la connexion
          if (dejaVisite === 'true') {
           setEtatApp('CONNEXION'); 
           } else {
        
           setEtatApp('ONBOARDING');
           }
           // setEtatApp('PILOTE1');
        
      }, 3000); 
    } catch (e) {
      setEtatApp('ONBOARDING');
    }
  };


  const finaliserOnboarding = async (prochainEcran) => {
    await AsyncStorage.setItem('@deja_visite', 'true');
    setEtatApp(prochainEcran);
  };

  if (etatApp === 'CHARGEMENT') {
    return <EcranChargement />;
  }

  if (etatApp === 'ONBOARDING') {
    return (
      <OnboardingScreen 
        auAllerConnexion={() => finaliserOnboarding('CONNEXION')}
        auAllerInscription={() => finaliserOnboarding('INSCRIPTION')}
      />
    );
  }

  if (etatApp === 'CONNEXION') {
    return (
      <ConnexionScreen 
        auInscription={() => setEtatApp('INSCRIPTION')} 
        auRetour={() => setEtatApp('ONBOARDING')}
        auOublieMdp={() => setEtatApp('OUBLIE_MDP')}
      />
    );
  }

  if (etatApp === 'INSCRIPTION') {
    return (
      <InscriptionScreen
        auConnexion={() => setEtatApp('CONNEXION')}
        auRetour={() => setEtatApp('CONNEXION')}
      />
    );
  }

  if (etatApp === 'OUBLIE_MDP') {
    return (
      <OublieMdpScreen 
        auRetour={() => setEtatApp('CONNEXION')}
      />
    );
  }

  if (etatApp === 'PILOTE1') {
    return <Pilote1Screen />;
  }

  return null;
}