import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const Couleurs = {
  blancPur: '#FFFFFF',
  fondGris: '#F8F9FA',
  vertAgentrix: '#15803D', // Vert professionnel
  vertClair: '#DCFCE7',
  texteNoir: '#000000',
  texteGris: '#6B7280',
  bordure: '#E5E7EB',
  erreur: '#EF4444'
};

export const StylesCommuns = StyleSheet.create({
  conteneur: {
    flex: 1,
    backgroundColor: Couleurs.blancPur,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 25,
  },
  grandTitre: {
    color: Couleurs.texteNoir,
    fontSize: 28,
    fontWeight: '800',
    textAlign: '',
  },
  sousTitre: {
    color: Couleurs.texteGris,
    fontSize: 15,
    marginTop: 8,
    lineHeight: 22,
  },
  label: {
    color: Couleurs.texteNoir,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    marginTop: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Couleurs.blancPur,
    borderWidth: 1,
    borderColor: Couleurs.bordure,
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 58,
  },
  inputText: {
    flex: 1,
    color: Couleurs.texteNoir,
    fontSize: 16,
    fontWeight: '500',
  },
  boutonVert: {
    backgroundColor: Couleurs.vertAgentrix,
    borderRadius: 12,
    height: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  texteBouton: {
    color: Couleurs.blancPur,
    fontSize: 16,
    fontWeight: '700',
  }
});