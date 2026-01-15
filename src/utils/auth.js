const AUTH_KEY = 'credibility_auth';
const TOKEN_KEY = 'credibility_token';

/**
 * Store authentication data and JWT token
 */
export const setAuth = (token, user) => {
  const authData = {
    isAuthenticated: true,
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      full_name: user.full_name
    },
    timestamp: Date.now()
  };
  localStorage.setItem(AUTH_KEY, JSON.stringify(authData));
  localStorage.setItem(TOKEN_KEY, token);
};

/**
 * Get JWT token from storage
 */
export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Check if user is authenticated (has valid token)
 */
export const isAuthenticated = () => {
  const token = getToken();
  if (!token) return false;
  
  // Check if token exists in auth data
  const authData = localStorage.getItem(AUTH_KEY);
  if (!authData) return false;
  
  try {
    const parsed = JSON.parse(authData);
    return parsed.isAuthenticated === true && parsed.token === token;
  } catch (error) {
    return false;
  }
};

/**
 * Get authentication data
 */
export const getAuthData = () => {
  const authData = localStorage.getItem(AUTH_KEY);
  if (!authData) return null;
  
  try {
    return JSON.parse(authData);
  } catch (error) {
    return null;
  }
};

/**
 * Get current user info
 */
export const getCurrentUser = () => {
  const authData = getAuthData();
  return authData?.user || null;
};

/**
 * Logout - clear all auth data
 */
export const logout = () => {
  localStorage.removeItem(AUTH_KEY);
  localStorage.removeItem(TOKEN_KEY);
};

/**
 * Legacy login function for backward compatibility
 * @deprecated Use setAuth instead
 */
export const login = (email, role) => {
  console.warn('login() is deprecated. Use setAuth() instead.');
  const authData = {
    isAuthenticated: true,
    email,
    role,
    timestamp: Date.now()
  };
  localStorage.setItem(AUTH_KEY, JSON.stringify(authData));
};