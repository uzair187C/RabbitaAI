// In dev, use Vite proxy (/api → :8080) so any port (5173, 5175, etc.) works
export const API_BASE = import.meta.env.DEV
  ? ''
  : import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080'

export function apiUrl(path) {
  return `${API_BASE}${path}`
}
