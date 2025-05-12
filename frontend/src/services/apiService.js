import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  }
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getCurrentUser: () => api.get('/auth/me'),
  updateProfile: (formData) => api.put('/auth/profile', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }),
  logout: () => {
    api.get('/auth/logout');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

export const journalApi = {
  getAllJournals: async () => {
    console.log('getAllJournals called, Authorization header:', api.defaults.headers.common['Authorization'] ? 'Set' : 'Not set');
    try {
      const response = await api.get('/journals');
      console.log(`getAllJournals succeeded, got ${response.data.length} journals`);
      return response;
    } catch (error) {
      console.error('getAllJournals failed:', error);
      throw error;
    }
  },
  getJournalById: (id) => api.get(`/journals/${id}`),
  getJournalMedia: (id, type, index = 0) => api.get(`/journals/${id}/media/${type}/${index}`, {
    responseType: 'blob'
  }),
  createJournal: (formData) => {
    return api.post('/journals', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }
};

export const aiApi = {
  analyzeText: (text) => api.post('/ai/text', { text }),
  analyzeImage: (imageUrl) => api.post('/ai/image', { imageUrl }),
  analyzeAudio: (audioFile) => {
    const formData = new FormData();
    formData.append('audio', audioFile);
    return api.post('/ai/audio', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }
};

export const chatApi = {
  getPositivityMessage: () => api.get('/positivity-chat'),
  getChatResponse: (conversationHistory) => api.post('/positivity-chat', { conversationHistory })
};

export const voiceApi = {
  processAudio: (audioBlob) => {
    const formData = new FormData();
    
    const mimeType = audioBlob.type || 'audio/webm';
    const extension = mimeType.includes('mp4') ? '.mp4' : '.webm';
    
    const fileName = `speech-${Date.now()}${extension}`;
    
    formData.append('audio', audioBlob, fileName);
    
    console.log(`Sending audio for processing, type: ${mimeType}, size: ${audioBlob.size} bytes`);
    
    if (audioBlob.size < 5000) {
      console.warn('Warning: Audio file is very small, may have recording issues');
    }
    
    return api.post('/call/process', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'X-File-Size': audioBlob.size,
        'X-File-Type': mimeType
      },
      timeout: 60000,
      validateStatus: status => status < 500,
      onUploadProgress: (progressEvent) => {
        console.log(`Upload progress: ${Math.round(progressEvent.loaded / progressEvent.total * 100)}%`);
      }
    });
  },
  generateResponse: (transcription) => api.post('/call/response', { transcription }, {
    timeout: 30000,
    validateStatus: status => status < 500
  })
};

export default api;