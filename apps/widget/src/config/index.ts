// src/config/index.ts
export const config = {
    // API Configuration (always localhost for local dev)
    API_URL: 'http://localhost:3001',
    
    // Feature flags
    isDevelopment: import.meta.env.DEV,
    useMocks: import.meta.env.VITE_USE_MOCKS !== 'false', // Default to true for safety
    
    // File upload configuration
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    SUPPORTED_FILE_TYPES: [
      'image/jpeg', 
      'image/png', 
      'image/jpg', 
      'application/pdf'
    ],
  };