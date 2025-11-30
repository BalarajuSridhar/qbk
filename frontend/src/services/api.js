import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const questionService = {
  // Upload DOCX file with questions
  uploadQuestions: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    return api.post('/upload-questions', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Get all questions
  getQuestions: () => {
    return api.get('/questions');
  },

  // Get single question
  getQuestion: (id) => {
    return api.get(`/questions/${id}`);
  },

  // Update question
  updateQuestion: (id, data) => {
    return api.put(`/questions/${id}`, data);
  },

  // Delete question
  deleteQuestion: (id) => {
    return api.delete(`/questions/${id}`);
  },
};

export default api;