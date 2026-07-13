// services/AgentrixApi.js
const BASE_URL = "https://agentrixservice.onrender.com";

const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw data || { success: false, message: "Une erreur est survenue" };
  }
  return data;
};

export const AuthService = {
  
  register: async (userData) => {
    const response = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nom: String(userData.nom || ''),
        prenom: String(userData.prenom || ''),
        email: String(userData.email || '')
      })
    });
    return await handleResponse(response);
  },

  verifyEmailOtp: async (email, otp) => {
    const response = await fetch(`${BASE_URL}/auth/verify-email-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: String(email),
        otp: String(otp)
      })
    });
    return await handleResponse(response);
  },

  setPassword: async (userId, password) => {
    const response = await fetch(`${BASE_URL}/auth/set-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: String(userId),
        password: String(password)
      })
    });
    return await handleResponse(response);
  },

  addNumber: async (userId, phoneNumber) => {
    const response = await fetch(`${BASE_URL}/auth/add-number`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: String(userId),
        phoneNumber: String(phoneNumber)
      })
    });
    return await handleResponse(response);
  },

  verifyPhoneOtp: async (phoneNumber, otp) => {
    const response = await fetch(`${BASE_URL}/auth/verify-phone-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phoneNumber: String(phoneNumber),
        otp: String(otp)
      })
    });
    return await handleResponse(response);
  },

  login: async (email, password) => {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email: String(email), 
        password: String(password) 
      })
    });
    return await handleResponse(response);
  },

  refreshToken: async (refreshToken) => {
    const response = await fetch(`${BASE_URL}/auth/token/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: String(refreshToken) })
    });
    return await handleResponse(response);
  },

  validateToken: async (accessToken) => {
    const response = await fetch(`${BASE_URL}/auth/token/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accessToken: String(accessToken) })
    });
    return await handleResponse(response);
  },

  logout: async (refreshToken) => {
    const response = await fetch(`${BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: String(refreshToken) })
    });
    return await handleResponse(response);
  },

  forgotPassword: async (number) => {
    const response = await fetch(`${BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ number: String(number) })
    });
    return await handleResponse(response);
  },

  resetPassword: async (number, code, newPassword) => {
    const response = await fetch(`${BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        number: String(number),
        code: String(code),
        newPassword: String(newPassword)
      })
    });
    return await handleResponse(response);
  },

  changePassword: async (userId, currentPassword, newPassword) => {
    const response = await fetch(`${BASE_URL}/auth/change-password`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: String(userId),
        currentPassword: String(currentPassword),
        newPassword: String(newPassword)
      })
    });
    return await handleResponse(response);
  }
};