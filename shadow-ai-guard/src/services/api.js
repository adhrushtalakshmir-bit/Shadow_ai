import axios from 'axios';

// ===== API CLIENT FOR SHADOW AI GUARD BACKEND =====

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API_BASE_URL = `${API_URL}/api/v1`;

// Create a reusable Axios instance with defaults
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 90000, // 90 second timeout (to allow local LLM loading on CPU)
});

// Add a request interceptor to dynamically attach the JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * POST /api/v1/detect
 * Sends a user prompt to the backend detection engine.
 * Returns: sanitized text, risk score, and detected entities.
 */
export async function detectSensitiveData(prompt) {
  try {
    const response = await apiClient.post('/detect', { prompt: prompt });
    return { success: true, data: response.data };
  } catch (error) {
    console.error('[API] Detection failed:', error);
    return {
      success: false,
      error: error.response?.data?.detail || error.message || 'Detection API is unreachable.',
    };
  }
}

/**
 * POST /api/v1/chat
 * Sends a prompt to the backend where it is sanitized and then forwarded to the selected LLM.
 * Returns: sanitized text, risk score, entities, and llm_response.
 */
export async function chatWithLLM(prompt, model = 'gemini') {
  try {
    const response = await apiClient.post('/chat', { text: prompt, model: model });
    return { success: true, data: response.data };
  } catch (error) {
    console.error('[API] Chat failed:', error);
    return {
      success: false,
      error: error.response?.data?.detail || error.message || 'Chat API is unreachable.',
    };
  }
}

/**
 * POST /api/v1/scan
 * Scans a prompt and returns only the list of detected entities.
 */
export async function scanPrompt(prompt) {
  try {
    const response = await apiClient.post('/scan', { prompt });
    return { success: true, data: response.data };
  } catch (error) {
    console.error('[API] Scan failed:', error);
    return {
      success: false,
      error: error.response?.data?.detail || error.message || 'Scan API is unreachable.',
    };
  }
}

/**
 * POST /api/v1/mask
 * Scans and masks a prompt, returning only the sanitized string.
 */
export async function maskPrompt(prompt) {
  try {
    const response = await apiClient.post('/mask', { prompt });
    return { success: true, data: response.data };
  } catch (error) {
    console.error('[API] Mask failed:', error);
    return {
      success: false,
      error: error.response?.data?.detail || error.message || 'Mask API is unreachable.',
    };
  }
}

/**
 * GET /api/v1/health
 * Checks if the backend is online.
 */
export async function checkHealth() {
  try {
    const response = await apiClient.get('/health');
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: 'Backend is offline.' };
  }
}

export default apiClient;
