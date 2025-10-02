// Configuración de la aplicación
const config = {
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  NODE_ENV: import.meta.env.NODE_ENV || 'development'
};

export default config;