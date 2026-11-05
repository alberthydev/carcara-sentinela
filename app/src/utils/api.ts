import { clearAuth, getAuthToken } from './authStorage';

export const fetchApi = async (url: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  
  const tokenValido = token && token !== 'undefined' && token !== 'null';

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
    ...(tokenValido ? { 'Authorization': `Bearer ${token}` } : {})
  };

  const response = await fetch(url, { ...options, headers });

  if (response.status === 401) {
    alert("Sua sessão é inválida ou expirou. Faça login novamente.");
    clearAuth();
    window.location.href = '/login'; 
  }

  return response;
}