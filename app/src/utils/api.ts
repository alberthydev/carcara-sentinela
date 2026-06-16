export const fetchApi = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token');
  
  const tokenValido = token && token !== 'undefined' && token !== 'null';

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
    ...(tokenValido ? { 'Authorization': `Bearer ${token}` } : {})
  };

  const response = await fetch(url, { ...options, headers });

  if (response.status === 401 || response.status === 403) {
    alert("Sua sessão é inválida ou expirou. Faça login novamente.");
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login'; 
  }

  return response;
}