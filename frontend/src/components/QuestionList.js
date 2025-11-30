import React, { useState, useEffect } from 'react';
import { questionService } from '../services/api';
import QuestionEditor from './QuestionEditor';

const QuestionList = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    language: '',
    type: '',
    hasImages: ''
  });
  const [stats, setStats] = useState({
    total: 0,
    english: 0,
    hindi: 0,
    withQuestionImages: 0,
    withSolutionImages: 0,
    withOptionImages: 0
  });

  useEffect(() => {
    loadQuestions();
    loadStats();
  }, []);

  const loadQuestions = async (filterParams = {}) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (filterParams.language) params.append('language', filterParams.language);
      if (filterParams.type) params.append('type', filterParams.type);
      if (filterParams.hasImages) params.append('has_images', filterParams.hasImages);
      
      const queryString = params.toString();
      const url = queryString ? `/api/questions/filter?${queryString}` : '/api/questions';
      
      const response = await questionService.getQuestions(queryString ? { params: filterParams } : {});
      setQuestions(response.data.questions || response.data);
    } catch (error) {
      setError('Error loading questions: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await questionService.getStats();
      const imageStats = response.data.image_stats || {};
      setStats({
        total: response.data.summary?.total_questions || 0,
        english: response.data.language_distribution?.find(lang => lang.language === 'english')?.count || 0,
        hindi: response.data.language_distribution?.find(lang => lang.language === 'hindi')?.count || 0,
        withQuestionImages: imageStats.with_question_images || 0,
        withSolutionImages: imageStats.with_solution_images || 0,
        withOptionImages: imageStats.with_option_images || 0
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath || imagePath === 'null' || imagePath === 'None') return null;
    
    // Extract filename from path (handles both / and \ separators)
    const filename = imagePath.split(/[\\/]/).pop();
    return `http://localhost:5000/api/images/${filename}`;
  };

  const handleFilterChange = (filterType, value) => {
    const newFilters = { ...filters, [filterType]: value };
    setFilters(newFilters);
    loadQuestions(newFilters);
  };

  const clearFilters = () => {
    setFilters({ language: '', type: '', hasImages: '' });
    loadQuestions();
  };

  const handleEdit = (question) => {
    setEditingQuestion(question);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      try {
        await questionService.deleteQuestion(id);
        setQuestions(questions.filter(q => q.id !== id));
        loadStats(); // Refresh stats after deletion
      } catch (error) {
        setError('Error deleting question: ' + error.message);
      }
    }
  };

  const handleUpdate = async (updatedQuestion) => {
    try {
      await questionService.updateQuestion(updatedQuestion.id, updatedQuestion);
      setQuestions(questions.map(q => 
        q.id === updatedQuestion.id ? updatedQuestion : q
      ));
      setEditingQuestion(null);
      loadStats(); // Refresh stats after update
    } catch (error) {
      setError('Error updating question: ' + error.message);
    }
  };

  const handleCancelEdit = () => {
    setEditingQuestion(null);
  };

  const getLanguageBadge = (language) => {
    const languageConfig = {
      english: { label: 'EN', class: 'bg-primary' },
      hindi: { label: 'HI', class: 'bg-warning text-dark' }
    };
    
    const config = languageConfig[language] || { label: language, class: 'bg-secondary' };
    return <span className={`badge ${config.class}`}>{config.label}</span>;
  };

  const getQuestionTypeBadge = (type) => {
    const typeConfig = {
      multiple_choice: { label: 'MCQ', class: 'bg-success' },
      integer: { label: 'Integer', class: 'bg-info' },
      fill_ups: { label: 'Fill Ups', class: 'bg-primary' },
      true_false: { label: 'True/False', class: 'bg-secondary' },
      comprehension: { label: 'Comprehension', class: 'bg-dark' }
    };
    
    const config = typeConfig[type] || { label: type, class: 'bg-light text-dark' };
    return <span className={`badge ${config.class}`}>{config.label}</span>;
  };

  // Fix for option display - handle both array and object formats
  const getOptions = (question) => {
    if (!question.options) return [];
    
    // If options is already an array, return it
    if (Array.isArray(question.options)) {
      return question.options;
    }
    
    // If options is an object, convert to array
    if (typeof question.options === 'object') {
      return Object.values(question.options);
    }
    
    return [];
  };

  // Fix for correct answer detection
  const getCorrectAnswer = (question) => {
    if (question.correct_answer) {
      return question.correct_answer;
    }
    
    // Try to find correct answer from options
    const options = getOptions(question);
    const correctOption = options.find(opt => opt.is_correct);
    if (correctOption) {
      const index = options.indexOf(correctOption);
      return String.fromCharCode(65 + index); // A, B, C, D
    }
    
    return null;
  };

  // Fix for option text display
  const getOptionText = (option) => {
    if (!option) return '';
    
    // Handle different option formats
    if (typeof option === 'string') {
      return option;
    }
    
    if (typeof option === 'object') {
      return option.text || option.option_text || option.content || '';
    }
    
    return String(option);
  };

  // Check if option has image
  const getOptionImage = (option) => {
    if (!option || typeof option !== 'object') return null;
    return option.image_path || null;
  };

  // Fix for option correctness
  const isOptionCorrect = (option, index, question) => {
    if (!option) return false;
    
    // If option has is_correct property
    if (typeof option === 'object' && option.is_correct !== undefined) {
      return option.is_correct;
    }
    
    // Check against correct_answer
    const correctAnswer = getCorrectAnswer(question);
    const optionLetter = String.fromCharCode(65 + index);
    return correctAnswer === optionLetter;
  };

  // Check if question has any images
  const hasAnyImages = (question) => {
    return question.image_path || 
           question.solution_image_path || 
           getOptions(question).some(opt => getOptionImage(opt));
  };

  if (loading) return (
    <div className="text-center py-5">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading questions...</span>
      </div>
      <div className="mt-2">Loading questions...</div>
    </div>
  );

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>Question Bank</h3>
        <div className="d-flex gap-3 align-items-center">
          <div className="text-end">
            <div className="fw-bold">{stats.total} Total Questions</div>
            <div className="small text-muted">
              {stats.english} English • {stats.hindi} Hindi • 
              {stats.withQuestionImages} Q-Images • {stats.withSolutionImages} S-Images • {stats.withOptionImages} O-Images
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-3">
              <label className="form-label">Language</label>
              <select 
                className="form-select"
                value={filters.language}
                onChange={(e) => handleFilterChange('language', e.target.value)}
              >
                <option value="">All Languages</option>
                <option value="english">English</option>
                <option value="hindi">Hindi</option>
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label">Question Type</label>
              <select 
                className="form-select"
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
              >
                <option value="">All Types</option>
                <option value="multiple_choice">Multiple Choice</option>
                <option value="integer">Integer</option>
                <option value="fill_ups">Fill Ups</option>
                <option value="true_false">True/False</option>
                <option value="comprehension">Comprehension</option>
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label">Image Status</label>
              <select 
                className="form-select"
                value={filters.hasImages}
                onChange={(e) => handleFilterChange('hasImages', e.target.value)}
              >
                <option value="">All Questions</option>
                <option value="true">With Images</option>
                <option value="false">Without Images</option>
              </select>
            </div>
            <div className="col-md-3 d-flex align-items-end">
              <button 
                className="btn btn-outline-secondary w-100"
                onClick={clearFilters}
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {error}
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setError('')}
          ></button>
        </div>
      )}

      {editingQuestion ? (
        <QuestionEditor
          question={editingQuestion}
          onSave={handleUpdate}
          onCancel={handleCancelEdit}
        />
      ) : (
        <div>
          {questions.length === 0 ? (
            <div className="text-center py-5">
              <div className="text-muted">
                <i className="bi bi-inbox display-1"></i>
                <h4 className="mt-3">No questions found</h4>
                <p>Try adjusting your filters or upload some questions to get started.</p>
              </div>
            </div>
          ) : (
            <div className="row">
              {questions.map((question) => {
                const questionImageUrl = getImageUrl(question.image_path);
                const solutionImageUrl = getImageUrl(question.solution_image_path);
                const hasQuestionImage = !!questionImageUrl;
                const hasSolutionImage = !!solutionImageUrl;
                const options = getOptions(question);
                const correctAnswer = getCorrectAnswer(question);
                const hasOptionImages = options.some(opt => getOptionImage(opt));
                
                return (
                  <div key={question.id} className="col-md-6 col-lg-4 mb-4">
                    <div className="card h-100 question-card">
                      <div className="card-header d-flex justify-content-between align-items-center">
                        <div className="d-flex gap-2">
                          {getLanguageBadge(question.language)}
                          {getQuestionTypeBadge(question.question_type)}
                        </div>
                        <div className="d-flex gap-1">
                          {hasQuestionImage && (
                            <span className="badge bg-info" title="Has question image">📷Q</span>
                          )}
                          {hasSolutionImage && (
                            <span className="badge bg-warning text-dark" title="Has solution image">📷S</span>
                          )}
                          {hasOptionImages && (
                            <span className="badge bg-success" title="Has option images">📷O</span>
                          )}
                          <span className="badge bg-dark">{question.marks} mark{question.marks !== 1 ? 's' : ''}</span>
                        </div>
                      </div>
                      
                      <div className="card-body">
                        {/* Question Text */}
                        <h6 className="card-title text-primary">Question:</h6>
                        <p className="card-text question-text" style={{ whiteSpace: 'pre-wrap' }}>
                          {question.question_text}
                        </p>
                        
                        {/* Question Image Section */}
                        {hasQuestionImage ? (
                          <div className="mb-3">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <small className="text-success">
                                <i className="bi bi-image me-1"></i>
                                Question Image
                              </small>
                              <small className="text-muted">
                                {question.image_path?.split(/[\\/]/).pop()}
                              </small>
                            </div>
                            <div className="text-center border rounded p-2 bg-light">
                              <img 
                                src={questionImageUrl}
                                alt="Question illustration"
                                className="img-fluid rounded"
                                style={{ 
                                  maxHeight: '150px', 
                                  maxWidth: '100%',
                                  objectFit: 'contain' 
                                }}
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.parentElement.innerHTML = `
                                    <div class="alert alert-warning py-2 small mb-0">
                                      <i class="bi bi-exclamation-triangle me-1"></i>
                                      Question image failed to load
                                    </div>
                                  `;
                                }}
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="mb-3 text-center">
                            <small className="text-muted">
                              <i className="bi bi-file-text me-1"></i>
                              No question image
                            </small>
                          </div>
                        )}

                        {/* Options */}
                        {options.length > 0 && (
                          <div className="mt-3">
                            <h6 className="text-primary">Options:</h6>
                            <div className="list-group list-group-flush">
                              {options.map((option, index) => {
                                const optionText = getOptionText(option);
                                const isCorrect = isOptionCorrect(option, index, question);
                                const optionImageUrl = getImageUrl(getOptionImage(option));
                                const hasOptionImage = !!optionImageUrl;
                                
                                return (
                                  <div 
                                    key={index} 
                                    className={`list-group-item px-0 py-2 ${isCorrect ? 'bg-success bg-opacity-10 border-success' : ''}`}
                                  >
                                    <div className="d-flex align-items-start">
                                      <span className="badge bg-light text-dark me-2 mt-1">
                                        {String.fromCharCode(65 + index)}
                                      </span>
                                      <div className="flex-grow-1">
                                        <div className="d-flex align-items-start justify-content-between">
                                          <span className={isCorrect ? 'fw-bold text-success' : ''}>
                                            {optionText || `Option ${String.fromCharCode(65 + index)}`}
                                          </span>
                                          {hasOptionImage && (
                                            <span className="badge bg-info ms-2 small" title="Option has image">
                                              📷
                                            </span>
                                          )}
                                        </div>
                                        {isCorrect && (
                                          <span className="badge bg-success mt-1 small">
                                            <i className="bi bi-check-lg me-1"></i>
                                            Correct
                                          </span>
                                        )}
                                        {/* Option Image */}
                                        {hasOptionImage && (
                                          <div className="mt-2">
                                            <div className="text-center border rounded p-1 bg-light">
                                              <img 
                                                src={optionImageUrl}
                                                alt={`Option ${String.fromCharCode(65 + index)} illustration`}
                                                className="img-fluid rounded"
                                                style={{ 
                                                  maxHeight: '100px', 
                                                  maxWidth: '100%',
                                                  objectFit: 'contain' 
                                                }}
                                                onError={(e) => {
                                                  e.target.style.display = 'none';
                                                  e.target.parentElement.innerHTML = `
                                                    <div class="alert alert-warning py-1 small mb-0">
                                                      <i class="bi bi-exclamation-triangle me-1"></i>
                                                      Option image failed to load
                                                    </div>
                                                  `;
                                                }}
                                              />
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Correct Answer */}
                        {correctAnswer && (
                          <div className="mt-3">
                            <strong className="text-primary">Correct Answer:</strong> 
                            <span className="badge bg-success ms-2">
                              {correctAnswer}
                            </span>
                          </div>
                        )}

                        {/* Solution */}
                        {question.solution && (
                          <div className="mt-3">
                            <div className="d-flex justify-content-between align-items-center">
                              <strong className="text-primary">Solution:</strong>
                              {hasSolutionImage && (
                                <span className="badge bg-warning text-dark small">
                                  <i className="bi bi-image me-1"></i>
                                  Has Solution Image
                                </span>
                              )}
                            </div>
                            <div className="alert alert-light mt-1 small" style={{ whiteSpace: 'pre-wrap' }}>
                              {question.solution}
                            </div>
                            
                            {/* Solution Image */}
                            {hasSolutionImage && (
                              <div className="mt-2">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                  <small className="text-success">
                                    <i className="bi bi-image me-1"></i>
                                    Solution Image
                                  </small>
                                  <small className="text-muted">
                                    {question.solution_image_path?.split(/[\\/]/).pop()}
                                  </small>
                                </div>
                                <div className="text-center border rounded p-2 bg-light">
                                  <img 
                                    src={solutionImageUrl}
                                    alt="Solution illustration"
                                    className="img-fluid rounded"
                                    style={{ 
                                      maxHeight: '150px', 
                                      maxWidth: '100%',
                                      objectFit: 'contain' 
                                    }}
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                      e.target.parentElement.innerHTML = `
                                        <div class="alert alert-warning py-2 small mb-0">
                                          <i class="bi bi-exclamation-triangle me-1"></i>
                                          Solution image failed to load
                                        </div>
                                      `;
                                    }}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div className="card-footer bg-transparent">
                        <div className="d-flex justify-content-between align-items-center">
                          <small className="text-muted">
                            ID: {question.id}
                          </small>
                          <div>
                            <button
                              className="btn btn-sm btn-outline-primary me-2"
                              onClick={() => handleEdit(question)}
                              title="Edit question"
                            >
                              <i className="bi bi-pencil"></i>
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDelete(question.id)}
                              title="Delete question"
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default QuestionList;