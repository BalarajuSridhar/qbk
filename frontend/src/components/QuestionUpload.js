import React, { useState } from 'react';
import { questionService } from '../services/api';

const QuestionUpload = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setMessage('');
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage('Please select a file');
      return;
    }

    if (!file.name.endsWith('.docx')) {
      setMessage('Please upload a .docx file');
      return;
    }

    setUploading(true);
    try {
      const response = await questionService.uploadQuestions(file);
      setMessage(`Successfully uploaded ${response.data.question_ids.length} questions`);
      setFile(null);
      document.getElementById('file-input').value = '';
    } catch (error) {
      setMessage('Error uploading file: ' + (error.response?.data?.error || error.message));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3>Bulk Upload Questions</h3>
      </div>
      <div className="card-body">
        <div className="mb-3">
          <label htmlFor="file-input" className="form-label">
            Upload DOCX File
          </label>
          <input
            type="file"
            className="form-control"
            id="file-input"
            accept=".docx"
            onChange={handleFileChange}
          />
          <div className="form-text">
            Upload a .docx file containing questions in the specified format
          </div>
        </div>
        
        {message && (
          <div className={`alert ${message.includes('Error') ? 'alert-danger' : 'alert-success'}`}>
            {message}
          </div>
        )}

        <button
          className="btn btn-primary"
          onClick={handleUpload}
          disabled={uploading || !file}
        >
          {uploading ? 'Uploading...' : 'Upload Questions'}
        </button>
      </div>
    </div>
  );
};

export default QuestionUpload;