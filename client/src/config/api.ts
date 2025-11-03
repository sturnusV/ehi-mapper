// API configuration
export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Helper function for API calls
export const apiFetch = (endpoint: string, options?: RequestInit) => {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;
  return fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });
};

console.log('🔗 API Base URL:', API_BASE);