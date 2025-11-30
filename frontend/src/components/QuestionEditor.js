import React, { useState, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const QuestionEditor = ({ question, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    question_text: question.question_text || '',
    question_type: question.question_type || 'multiple_choice',
    marks: question.marks || 1,
    correct_answer: question.correct_answer || '',
    solution: question.solution || '',
    options: question.options || [],
    image_path: question.image_path || '',
    language: question.language || 'english'
  });

  const [activeTab, setActiveTab] = useState('question');
  const fileInputRef = useRef(null);

  // ReactQuill modules configuration
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ 'font': [] }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'script': 'sub'}, { 'script': 'super' }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'align': [] }],
      ['blockquote', 'code-block'],
      ['link', 'image', 'video'],
      ['clean']
    ],
  };

  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'script',
    'list', 'bullet', 'indent',
    'align',
    'blockquote', 'code-block',
    'link', 'image', 'video'
  ];

  const getImageUrl = (imagePath) => {
    if (!imagePath || imagePath === 'null' || imagePath === 'None') return null;
    const filename = imagePath.split(/[\\/]/).pop();
    return `http://localhost:5000/api/images/${filename}`;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRichTextChange = (value, field) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Fix for option handling - ensure proper data structure
  const getOptionText = (option) => {
    if (!option) return '';
    if (typeof option === 'string') return option;
    if (typeof option === 'object') return option.text || option.option_text || option.content || '';
    return String(option);
  };

  const handleOptionChange = (index, field, value) => {
    const updatedOptions = [...formData.options];
    
    // Ensure option has proper structure
    if (!updatedOptions[index] || typeof updatedOptions[index] !== 'object') {
      updatedOptions[index] = { text: '', is_correct: false };
    }
    
    updatedOptions[index] = {
      ...updatedOptions[index],
      [field]: value
    };
    
    setFormData(prev => ({
      ...prev,
      options: updatedOptions
    }));
  };

  const handleOptionRichTextChange = (index, value) => {
    const updatedOptions = [...formData.options];
    
    // Ensure option has proper structure
    if (!updatedOptions[index] || typeof updatedOptions[index] !== 'object') {
      updatedOptions[index] = { text: '', is_correct: false };
    }
    
    updatedOptions[index] = {
      ...updatedOptions[index],
      text: value
    };
    
    setFormData(prev => ({
      ...prev,
      options: updatedOptions
    }));
  };

  const addOption = () => {
    setFormData(prev => ({
      ...prev,
      options: [...prev.options, { text: '', is_correct: false }]
    }));
  };

  const removeOption = (index) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Here you would typically upload the image to your server
      // For now, we'll just update the image path
      const newImagePath = `uploads/images/${file.name}`;
      setFormData(prev => ({
        ...prev,
        image_path: newImagePath
      }));
    }
  };

  const triggerImageUpload = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Ensure options have proper structure before saving
    const cleanedOptions = formData.options.map(option => {
      if (typeof option === 'string') {
        return { text: option, is_correct: false };
      }
      if (typeof option === 'object') {
        return {
          text: option.text || option.option_text || option.content || '',
          is_correct: option.is_correct || false
        };
      }
      return { text: String(option), is_correct: false };
    });

    const cleanedFormData = {
      ...formData,
      options: cleanedOptions
    };

    onSave({
      ...question,
      ...cleanedFormData
    });
  };

  const removeImage = () => {
    setFormData(prev => ({
      ...prev,
      image_path: ''
    }));
  };

  const imageUrl = getImageUrl(formData.image_path);

  // Initialize options if they don't exist or are malformed
  React.useEffect(() => {
    if (!formData.options || !Array.isArray(formData.options) || formData.options.length === 0) {
      setFormData(prev => ({
        ...prev,
        options: [
          { text: '', is_correct: false },
          { text: '', is_correct: false },
          { text: '', is_correct: false },
          { text: '', is_correct: false }
        ]
      }));
    }
  }, [formData.options]);

  return (
    <div className="card">
      <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
        <h4 className="mb-0">Edit Question</h4>
        <span className="badge bg-light text-dark">
          {formData.language === 'hindi' ? 'Hindi' : 'English'} | {formData.question_type}
        </span>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          {/* Navigation Tabs */}
          <ul className="nav nav-tabs mb-4">
            <li className="nav-item">
              <button
                type="button"
                className={`nav-link ${activeTab === 'question' ? 'active' : ''}`}
                onClick={() => setActiveTab('question')}
              >
                📝 Question
              </button>
            </li>
            <li className="nav-item">
              <button
                type="button"
                className={`nav-link ${activeTab === 'options' ? 'active' : ''}`}
                onClick={() => setActiveTab('options')}
              >
                🔘 Options
              </button>
            </li>
            <li className="nav-item">
              <button
                type="button"
                className={`nav-link ${activeTab === 'solution' ? 'active' : ''}`}
                onClick={() => setActiveTab('solution')}
              >
                💡 Solution
              </button>
            </li>
            <li className="nav-item">
              <button
                type="button"
                className={`nav-link ${activeTab === 'settings' ? 'active' : ''}`}
                onClick={() => setActiveTab('settings')}
              >
                ⚙️ Settings
              </button>
            </li>
          </ul>

          {/* Question Tab */}
          {activeTab === 'question' && (
            <div>
              <div className="mb-3">
                <label className="form-label fw-bold">Question Text</label>
                <ReactQuill
                  value={formData.question_text}
                  onChange={(value) => handleRichTextChange(value, 'question_text')}
                  modules={modules}
                  formats={formats}
                  theme="snow"
                  style={{ height: '200px', marginBottom: '50px' }}
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold">Attach Image</label>
                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    style={{ display: 'none' }}
                  />
                  <div className="d-flex gap-2 mb-2">
                    <button
                      type="button"
                      className="btn btn-outline-primary btn-sm"
                      onClick={triggerImageUpload}
                    >
                      📁 Upload New Image
                    </button>
                    {imageUrl && (
                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm"
                        onClick={removeImage}
                      >
                        🗑️ Remove Image
                      </button>
                    )}
                  </div>
                  {imageUrl && (
                    <div className="mt-2 p-3 border rounded bg-light">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <small className="text-success fw-bold">
                          <i className="bi bi-image me-1"></i>
                          Current Image
                        </small>
                        <small className="text-muted">
                          {formData.image_path?.split(/[\\/]/).pop()}
                        </small>
                      </div>
                      <img 
                        src={imageUrl}
                        alt="Question illustration"
                        className="img-fluid rounded border"
                        style={{ maxHeight: '150px', maxWidth: '100%' }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML = `
                            <div class="alert alert-warning py-2 small mb-0">
                              <i class="bi bi-exclamation-triangle me-1"></i>
                              Image failed to load
                            </div>
                          `;
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Options Tab */}
          {activeTab === 'options' && (
            <div>
              <div className="mb-3">
                <label className="form-label fw-bold">Question Type</label>
                <select
                  className="form-select"
                  name="question_type"
                  value={formData.question_type}
                  onChange={handleInputChange}
                >
                  <option value="multiple_choice">Multiple Choice</option>
                  <option value="integer">Integer</option>
                  <option value="fill_ups">Fill in the Blanks</option>
                  <option value="true_false">True/False</option>
                  <option value="comprehension">Comprehension</option>
                </select>
              </div>

              {formData.question_type === 'multiple_choice' && (
                <div className="mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <label className="form-label fw-bold">Options</label>
                    <button
                      type="button"
                      className="btn btn-success btn-sm"
                      onClick={addOption}
                    >
                      + Add Option
                    </button>
                  </div>
                  
                  {formData.options.map((option, index) => (
                    <div key={index} className="card mb-3 border-primary">
                      <div className="card-header bg-light d-flex justify-content-between align-items-center">
                        <span className="fw-bold">Option {String.fromCharCode(65 + index)}</span>
                        <div className="d-flex align-items-center gap-2">
                          <div className="form-check form-switch">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              id={`correct-${index}`}
                              checked={option.is_correct || false}
                              onChange={(e) => handleOptionChange(index, 'is_correct', e.target.checked)}
                            />
                            <label className="form-check-label small" htmlFor={`correct-${index}`}>
                              Correct Answer
                            </label>
                          </div>
                          {formData.options.length > 1 && (
                            <button
                              type="button"
                              className="btn btn-outline-danger btn-sm"
                              onClick={() => removeOption(index)}
                              title="Remove option"
                            >
                              🗑️
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="card-body">
                        <label className="form-label small text-muted">Option Text</label>
                        <ReactQuill
                          value={getOptionText(option)}
                          onChange={(value) => handleOptionRichTextChange(index, value)}
                          modules={modules}
                          formats={formats}
                          theme="snow"
                          style={{ height: '120px', marginBottom: '40px' }}
                        />
                      </div>
                    </div>
                  ))}
                  
                  {/* Correct Answer Summary */}
                  <div className="mt-3 p-3 bg-light rounded">
                    <strong>Correct Answer Summary:</strong>
                    <div className="mt-1">
                      {formData.options.filter(opt => opt.is_correct).length === 0 ? (
                        <span className="text-warning">⚠️ No correct answer selected</span>
                      ) : (
                        formData.options
                          .filter(opt => opt.is_correct)
                          .map((opt, idx) => (
                            <span key={idx} className="badge bg-success me-2">
                              {String.fromCharCode(65 + formData.options.indexOf(opt))}
                            </span>
                          ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {(formData.question_type === 'integer' || 
                formData.question_type === 'fill_ups' || 
                formData.question_type === 'true_false') && (
                <div className="mb-3">
                  <label className="form-label fw-bold">Correct Answer</label>
                  <ReactQuill
                    value={formData.correct_answer}
                    onChange={(value) => handleRichTextChange(value, 'correct_answer')}
                    modules={modules}
                    formats={formats}
                    theme="snow"
                    style={{ height: '120px', marginBottom: '40px' }}
                  />
                </div>
              )}
            </div>
          )}

          {/* Solution Tab */}
          {activeTab === 'solution' && (
            <div className="mb-3">
              <label className="form-label fw-bold">Solution</label>
              <ReactQuill
                value={formData.solution}
                onChange={(value) => handleRichTextChange(value, 'solution')}
                modules={modules}
                formats={formats}
                theme="snow"
                style={{ height: '200px', marginBottom: '50px' }}
              />
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div>
              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label fw-bold">Marks</label>
                    <input
                      type="number"
                      className="form-control"
                      name="marks"
                      value={formData.marks}
                      onChange={handleInputChange}
                      min="1"
                      required
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label fw-bold">Language</label>
                    <select
                      className="form-select"
                      name="language"
                      value={formData.language}
                      onChange={handleInputChange}
                    >
                      <option value="english">English</option>
                      <option value="hindi">Hindi</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="mb-3">
                <label className="form-label fw-bold">Question Type</label>
                <select
                  className="form-select"
                  name="question_type"
                  value={formData.question_type}
                  onChange={handleInputChange}
                >
                  <option value="multiple_choice">Multiple Choice</option>
                  <option value="integer">Integer</option>
                  <option value="fill_ups">Fill in the Blanks</option>
                  <option value="true_false">True/False</option>
                  <option value="comprehension">Comprehension</option>
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold">Correct Answer</label>
                <input
                  type="text"
                  className="form-control"
                  name="correct_answer"
                  value={formData.correct_answer}
                  onChange={handleInputChange}
                  placeholder="A, B, C, D or specific answer"
                />
                <div className="form-text">
                  For multiple choice, this should be A, B, C, or D. For other types, enter the specific correct answer.
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="d-flex gap-2 mt-4 pt-3 border-top">
            <button type="submit" className="btn btn-success">
              💾 Save Changes
            </button>
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              ❌ Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuestionEditor;