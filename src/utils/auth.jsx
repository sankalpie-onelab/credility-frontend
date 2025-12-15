const AUTH_KEY = 'credibility_auth';

export const login = (email, role) => {
  const authData = {
    isAuthenticated: true,
    email,
    role,
    timestamp: Date.now()
  };
  localStorage.setItem(AUTH_KEY, JSON.stringify(authData));
};

export const logout = () => {
  localStorage.removeItem(AUTH_KEY);
};

export const isAuthenticated = () => {
  const authData = localStorage.getItem(AUTH_KEY);
  if (!authData) return false;
  
  try {
    const parsed = JSON.parse(authData);
    return parsed.isAuthenticated === true;
  } catch (error) {
    return false;
  }
};

export const getAuthData = () => {
  const authData = localStorage.getItem(AUTH_KEY);
  if (!authData) return null;
  
  try {
    return JSON.parse(authData);
  } catch (error) {
    return null;
  }
};
