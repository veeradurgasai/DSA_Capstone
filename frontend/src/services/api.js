/**
 * Centralized API client for Lost & Found Intelligence System.
 * Automatically injects JWT Bearer tokens and handles error states cleanly.
 */

function getBaseUrl() {
  const envUrl = import.meta.env.VITE_API_URL;
  let url = (envUrl && typeof envUrl === 'string' && envUrl.trim()) ? envUrl.trim() : 'http://localhost:8080/api';
  // Strip trailing slashes
  while (url.endsWith('/')) {
    url = url.slice(0, -1);
  }
  // Ensure base ends with /api if not present
  if (!url.endsWith('/api')) {
    url = `${url}/api`;
  }
  return url;
}

const BASE_URL = getBaseUrl();

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const config = {
    ...options,
    headers
  };

  const url = `${BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, config);

    if (response.status === 204) {
      return null;
    }

    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');
    const data = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      let errorMsg;
      if (typeof data === 'object' && data !== null) {
        errorMsg = data.message || data.errorMessage || data.error;
      }
      if (!errorMsg) {
        if (response.status === 400) {
          errorMsg = 'Bad request. Please verify the submitted data.';
        } else if (response.status === 401) {
          errorMsg = 'Invalid credentials or session expired.';
        } else if (response.status === 403) {
          errorMsg = 'Access denied or account is pending administrator approval.';
        } else if (response.status === 404) {
          errorMsg = 'Requested resource not found.';
        } else if (response.status >= 500) {
          errorMsg = 'Server error. Please try again later.';
        } else {
          errorMsg = `HTTP Error ${response.status}`;
        }
      }
      const error = new Error(errorMsg);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    // Catch fetch network errors (e.g. backend down or unreachable)
    if (error.name === 'TypeError' && (error.message.includes('fetch') || error.message.includes('NetworkError') || error.message.includes('Failed'))) {
      const friendlyError = new Error('Unable to connect to the server. Please verify the backend server is running on http://localhost:8080.');
      friendlyError.status = 0;
      friendlyError.originalError = error;
      console.error(`[API Network Error] Could not reach ${url}:`, error.message);
      throw friendlyError;
    }
    console.error(`[API Error] [${options.method || 'GET'}] ${endpoint}:`, error.message);
    throw error;
  }
}

export const api = {
  get: (endpoint, params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.append(key, value);
      }
    });
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return request(`${endpoint}${queryString}`, { method: 'GET' });
  },

  post: (endpoint, body) => {
    return request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  },

  put: (endpoint, body) => {
    return request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body)
    });
  },

  delete: (endpoint, body) => {
    return request(endpoint, {
      method: 'DELETE',
      ...(body ? { body: JSON.stringify(body) } : {})
    });
  }
};

export default api;
