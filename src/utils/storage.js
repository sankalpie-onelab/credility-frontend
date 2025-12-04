// Local Storage utility functions

const CREATOR_ID_KEY = 'credibility_creator_id';
const USER_ID_KEY = 'credibility_user_id';

// Generate a unique ID
export const generateId = (prefix = 'user') => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `${prefix}_${timestamp}_${random}`;
};

// Creator ID Management
export const getCreatorId = () => {
  let creatorId = localStorage.getItem(CREATOR_ID_KEY);
  if (!creatorId) {
    creatorId = generateId('creator');
    localStorage.setItem(CREATOR_ID_KEY, creatorId);
  }
  return creatorId;
};

export const setCreatorId = (id) => {
  localStorage.setItem(CREATOR_ID_KEY, id);
};

// User ID Management (for document validation)
export const getUserId = () => {
  let userId = localStorage.getItem(USER_ID_KEY);
  if (!userId) {
    userId = generateId('user');
    localStorage.setItem(USER_ID_KEY, userId);
  }
  return userId;
};

export const setUserId = (id) => {
  localStorage.setItem(USER_ID_KEY, id);
};

// Generic storage functions
export const setItem = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

export const getItem = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return defaultValue;
  }
};

export const removeItem = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing from localStorage:', error);
  }
};

export const clearStorage = () => {
  try {
    localStorage.clear();
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
};

