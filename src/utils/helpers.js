// Helper utility functions

// Format date to readable string
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Format number with commas
export const formatNumber = (num) => {
  if (num === null || num === undefined) return '0';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

// Calculate percentage
export const calculatePercentage = (value, total) => {
  if (!total) return 0;
  return ((value / total) * 100).toFixed(1);
};

// Validate agent name format
export const validateAgentName = (name) => {
  const regex = /^[a-z0-9_]{3,100}$/;
  return regex.test(name);
};

// Get status color for Chakra UI
export const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'pass':
      return 'green';
    case 'fail':
      return 'red';
    case 'error':
      return 'orange';
    default:
      return 'gray';
  }
};

// Get mode badge color
export const getModeColor = (mode) => {
  switch (mode) {
    case 'ocr+llm':
      return 'purple';
    case 'llm':
      return 'blue';
    default:
      return 'gray';
  }
};

// Truncate text
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// File size formatter
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

// Validate file type
export const isValidFileType = (file) => {
  const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
  return validTypes.includes(file.type);
};

