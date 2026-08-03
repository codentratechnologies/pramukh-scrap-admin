const BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const apiFetch = async (endpoint, options = {}) => {
  let token = localStorage.getItem('access_token');

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  let response = await fetch(`${BASE_URL}${endpoint}`, config);

  // If 401 Unauthorized, try to refresh the token
  if (response.status === 401) {
    const refreshToken = localStorage.getItem('refresh_token');
    
    if (refreshToken) {
      try {
        const refreshResponse = await fetch(`${BASE_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: refreshToken })
        });
        
        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          localStorage.setItem('access_token', data.access_token);
          
          // Update the original request's headers with the new token
          headers['Authorization'] = `Bearer ${data.access_token}`;
          
          // Retry original request
          response = await fetch(`${BASE_URL}${endpoint}`, {
            ...options,
            headers
          });
        } else {
          // Refresh failed (e.g. refresh token expired)
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.reload(); // Force login
        }
      } catch (e) {
        console.error('Refresh token failed:', e);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.reload();
      }
    } else {
      // No refresh token available, force login
      localStorage.removeItem('access_token');
      window.location.reload();
    }
  }

  return response;
};
