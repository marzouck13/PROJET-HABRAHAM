/**
 * Service d'Authentification Agentrix (Version Fetch Natif)
 */

const BASE_URL = "https://agentrixservice.onrender.com";

// Helper pour gérer les réponses et les erreurs
const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    // Si le serveur renvoie une erreur (400, 401, 500, etc.)
    throw data || { success: false, message: "Une erreur est survenue" };
  }
  return data;
};

export const AuthService = {
  
  /**
   * Inscription : name, firstname, number, password
   */
  register: async (userData) => {
    try {
      const response = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: String(userData.name),
          firstname: String(userData.firstname),
          email: String(userData.email),
          NPI: String(userData.NPI),
          number: String(userData.number),
          password: String(userData.password)
        }),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error("❌ [API] Erreur Register:", error);
      throw error;
    }
  },

  /**
   * Vérification du code OTP
   */
  verifyCode: async (number, code) => {
    try {
      const response = await fetch(`${BASE_URL}/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          number: String(number), 
          code: String(code) 
        }),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error("❌ [API] Erreur VerifyCode:", error);
      throw error;
    }
  },

  /**
   * Connexion (Retourne tokens et userId)
   */
  login: async (number, password) => {
    try {
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          number: String(number), 
          password: String(password) 
        }),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error("❌ [API] Erreur Login:", error);
      throw error;
    }
  },

  /**
   * Mot de passe oublié (Envoi du code par SMS)
   */
  forgotPassword: async (number) => {
    try {
      const response = await fetch(`${BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ number: String(number) }),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error("❌ [API] Erreur ForgotPassword:", error);
      throw error;
    }
  },

  /**
   * Réinitialisation finale du mot de passe
   */
  resetPassword: async (payload) => {
    console.log(payload)
    try {
      const response = await fetch(`${BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          number: String(payload.number),
          code: String(payload.code),
          newPassword: String(payload.newPassword)
        })
      });
      return await handleResponse(response);
    } catch (error) {
      console.error("❌ [API] Erreur ResetPassword:", error);
      throw error;
    }
  }
};