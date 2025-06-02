// Константы для доступа к переменным окружения
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';
export const API_TRACKS_URL = `${API_URL}/tracks`;
export const API_AUTH_URL = `${API_URL}/auth`;
export const API_PLAYLISTS_URL = `${API_URL}/playlists`;
export const API_UPLOAD_URL = `${API_URL}/upload`;
