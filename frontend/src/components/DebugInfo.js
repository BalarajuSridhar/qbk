import React from 'react';

const DebugInfo = ({ questions }) => {
  return (
    <div className="card mt-4">
      <div className="card-header">
        <h5>Debug Information</h5>
      </div>
      <div className="card-body">
        <h6>Image Paths:</h6>
        {questions.map((q, index) => (
          <div key={q.id} className="mb-2">
            <strong>Q{index + 1}:</strong> {q.image_path}
            <br />
            <small className="text-muted">
              URL: http://localhost:5000/api/images/{q.image_path ? q.image_path.split(/[\\/]/).pop() : 'none'}
            </small>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DebugInfo;