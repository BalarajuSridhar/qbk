import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import QuestionUpload from './components/QuestionUpload';
import QuestionList from './components/QuestionList';

function App() {
  const [activeTab, setActiveTab] = useState('upload');

  return (
    <div className="container-fluid">
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary mb-4">
        <div className="container">
          <span className="navbar-brand">Exam Portal</span>
          <div className="navbar-nav">
            <button
              className={`nav-link btn btn-link ${activeTab === 'upload' ? 'active' : ''}`}
              onClick={() => setActiveTab('upload')}
            >
              Bulk Upload
            </button>
            <button
              className={`nav-link btn btn-link ${activeTab === 'questions' ? 'active' : ''}`}
              onClick={() => setActiveTab('questions')}
            >
              Question Bank
            </button>
          </div>
        </div>
      </nav>

      <div className="container">
        {activeTab === 'upload' && <QuestionUpload />}
        {activeTab === 'questions' && <QuestionList />}
      </div>
    </div>
  );
}

export default App;