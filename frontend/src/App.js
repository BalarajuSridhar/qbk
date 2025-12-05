// src/App.js
import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import QuestionUpload from './components/QuestionUpload';
import QuestionList from './components/QuestionList';
import QuestionStats from './components/QuestionStats';

function App() {
  const [activeTab, setActiveTab] = useState('upload');

  return (
    <div className="container-fluid p-0 min-vh-100 bg-light">
      {/* Header */}
      <header className="navbar navbar-expand-lg navbar-dark bg-primary shadow-lg sticky-top">
        <div className="container">
          <span className="navbar-brand fw-bold d-flex align-items-center">
            <i className="bi bi-journal-text me-2"></i>
            📚 Exam Portal - Question Bank
          </span>
          
          <div className="navbar-nav ms-auto d-flex flex-row">
            <button 
              className={`nav-link btn ${activeTab === 'upload' ? 'btn-light text-primary' : 'btn-link text-white'} me-2 d-flex align-items-center`} 
              onClick={() => setActiveTab('upload')}
            >
              <i className="bi bi-cloud-upload me-1"></i>
              Bulk Upload
            </button>
            <button 
              className={`nav-link btn ${activeTab === 'questions' ? 'btn-light text-primary' : 'btn-link text-white'} me-2 d-flex align-items-center`} 
              onClick={() => setActiveTab('questions')}
            >
              <i className="bi bi-list-check me-1"></i>
              Question Bank
            </button>
            <button 
              className={`nav-link btn ${activeTab === 'stats' ? 'btn-light text-primary' : 'btn-link text-white'} d-flex align-items-center`} 
              onClick={() => setActiveTab('stats')}
            >
              <i className="bi bi-graph-up me-1"></i>
              Analytics
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mt-4">
        {activeTab === 'upload' && <QuestionUpload />}
        {activeTab === 'questions' && <QuestionList />}
        {activeTab === 'stats' && <QuestionStats />}
      </main>

      {/* Footer */}
      <footer className="mt-5 py-3 bg-dark text-white">
        <div className="container">
          <div className="row">
            <div className="col-md-6">
              <h6>📚 Exam Portal - Question Bank System</h6>
              <p className="small mb-0">
                Multi-language question management with image support
              </p>
            </div>
            <div className="col-md-6 text-end">
              <small className="text-muted">
                Version 1.0 • {new Date().getFullYear()}
              </small>
              <br />
              <small className="text-muted">
                API: <code>http://localhost:5000</code>
              </small>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;