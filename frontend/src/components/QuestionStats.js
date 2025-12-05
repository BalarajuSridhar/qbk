// src/components/QuestionStats.js
import React, { useState, useEffect } from 'react';
import { questionService } from '../services/api';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, PieChart, 
  Pie, Cell, LineChart, Line 
} from 'recharts';

const QuestionStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState('7days');

  useEffect(() => {
    loadStats();
  }, [timeRange]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await questionService.getStats();
      setStats(response.data);
    } catch (error) {
      setError('Error loading statistics: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (loading) return (
    <div className="text-center py-5">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading statistics...</span>
      </div>
      <div className="mt-2">Loading statistics...</div>
    </div>
  );

  if (error) return (
    <div className="alert alert-danger">{error}</div>
  );

  if (!stats) return null;

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>📊 Question Bank Analytics</h3>
        <div className="btn-group">
          <button 
            className={`btn btn-outline-primary btn-sm ${timeRange === '7days' ? 'active' : ''}`}
            onClick={() => setTimeRange('7days')}
          >
            Last 7 Days
          </button>
          <button 
            className={`btn btn-outline-primary btn-sm ${timeRange === '30days' ? 'active' : ''}`}
            onClick={() => setTimeRange('30days')}
          >
            Last 30 Days
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card border-primary">
            <div className="card-body text-center">
              <h1 className="display-4 text-primary">{stats.summary?.total_questions || 0}</h1>
              <h6 className="text-muted">Total Questions</h6>
            </div>
          </div>
        </div>
        
        <div className="col-md-3">
          <div className="card border-success">
            <div className="card-body text-center">
              <h1 className="display-4 text-success">
                {stats.language_distribution?.find(l => l.language === 'english')?.count || 0}
              </h1>
              <h6 className="text-muted">English Questions</h6>
            </div>
          </div>
        </div>
        
        <div className="col-md-3">
          <div className="card border-warning">
            <div className="card-body text-center">
              <h1 className="display-4 text-warning">
                {stats.language_distribution?.find(l => l.language === 'hindi')?.count || 0}
              </h1>
              <h6 className="text-muted">Hindi Questions</h6>
            </div>
          </div>
        </div>
        
        <div className="col-md-3">
          <div className="card border-info">
            <div className="card-body text-center">
              <h1 className="display-4 text-info">
                {stats.image_stats?.with_question_images || 0}
              </h1>
              <h6 className="text-muted">Questions with Images</h6>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="row mb-4">
        {/* Language Distribution */}
        <div className="col-md-6">
          <div className="card">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">🌍 Language Distribution</h5>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stats.language_distribution || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {stats.language_distribution?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Question Type Distribution */}
        <div className="col-md-6">
          <div className="card">
            <div className="card-header bg-success text-white">
              <h5 className="mb-0">📝 Question Type Distribution</h5>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={stats.type_distribution || []}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="question_type" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#82ca9d" name="Number of Questions" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Image Statistics */}
      <div className="row mb-4">
        <div className="col-md-12">
          <div className="card">
            <div className="card-header bg-info text-white">
              <h5 className="mb-0">🖼️ Image Usage Statistics</h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-3 text-center">
                  <div className="p-3 border rounded bg-light">
                    <h3 className="text-primary">
                      {stats.image_stats?.with_question_images || 0}
                    </h3>
                    <small className="text-muted">Questions with Images</small>
                  </div>
                </div>
                <div className="col-md-3 text-center">
                  <div className="p-3 border rounded bg-light">
                    <h3 className="text-success">
                      {stats.image_stats?.with_solution_images || 0}
                    </h3>
                    <small className="text-muted">Solutions with Images</small>
                  </div>
                </div>
                <div className="col-md-3 text-center">
                  <div className="p-3 border rounded bg-light">
                    <h3 className="text-warning">
                      {stats.image_stats?.with_option_images || 0}
                    </h3>
                    <small className="text-muted">Options with Images</small>
                  </div>
                </div>
                <div className="col-md-3 text-center">
                  <div className="p-3 border rounded bg-light">
                    <h3 className="text-secondary">
                      {stats.image_stats?.without_images || 0}
                    </h3>
                    <small className="text-muted">Questions without Images</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="row">
        <div className="col-md-12">
          <div className="card">
            <div className="card-header bg-dark text-white">
              <h5 className="mb-0">📈 Recent Activity (Last 7 Days)</h5>
            </div>
            <div className="card-body">
              {stats.recent_activity && stats.recent_activity.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={stats.recent_activity}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="count" 
                      stroke="#8884d8" 
                      activeDot={{ r: 8 }} 
                      name="Questions Added"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-4">
                  <div className="text-muted">
                    <i className="bi bi-calendar-x display-1"></i>
                    <h4 className="mt-3">No recent activity</h4>
                    <p>No questions have been added in the last 7 days.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionStats;