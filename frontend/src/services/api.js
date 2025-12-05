// src/services/api.js
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
  getQuestions: (params) => {
    return api.get('/questions', { params });
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

  // Get question statistics
  getStats: () => {
    return api.get('/questions/stats');
  },

  // Filter questions
  filterQuestions: (params) => {
    return api.get('/questions/filter', { params });
  },

  // Search questions
  searchQuestions: (searchTerm) => {
    return api.get('/questions/search', { params: { q: searchTerm } });
  },
  
  // Batch delete questions
  batchDeleteQuestions: (questionIds) => {
    return api.delete('/questions/batch', { data: { question_ids: questionIds } });
  }
};

export default api;