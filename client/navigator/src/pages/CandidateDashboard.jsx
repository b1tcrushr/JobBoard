import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../api/apiClient.js';
import { getSavedJobs, removeSavedJob } from '../hooks/savedJobs.js';
import "../styles/job.css";

const CandidateDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [applications, setApplications] = useState([]);
  const [candidateProfile, setCandidateProfile] = useState(null);
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Refresh saved jobs from local storage
    setSavedJobs(getSavedJobs());

    if (!user || !user.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    // Fetch candidate applications & profile stats
    Promise.all([
      api.get(`/api/applications/user/${user.id}`).catch(() => []),
      api.get(`/api/candidates/user/${user.id}`).catch(() => null)
    ])
      .then(([appsData, profileData]) => {
        setApplications(Array.isArray(appsData) ? appsData : []);
        setCandidateProfile(profileData);
      })
      .catch((err) => {
        setError(err.message || 'Failed to fetch dashboard data');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [user]);

  const handleRemoveSaved = (jobId) => {
    removeSavedJob(jobId);
    setSavedJobs(getSavedJobs());
  };

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'applied':
      case 'pending':
      case 'under review':
        return 'status-pending';
      case 'interview':
        return 'status-interview';
      case 'accepted':
        return 'status-accepted';
      case 'rejected':
        return 'status-rejected';
      default:
        return '';
    }
  };

  const formatStatus = (status) => {
    if (!status) return 'Applied';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  // Compute stats based on backend application records or profile totals
  const stats = {
    pending: applications.filter(a => ['applied', 'pending', 'under review'].includes(a.status?.toLowerCase())).length,
    interviews: applications.filter(a => a.status?.toLowerCase() === 'interview').length,
    accepted: applications.filter(a => a.status?.toLowerCase() === 'accepted').length,
    rejected: applications.filter(a => a.status?.toLowerCase() === 'rejected').length
  };

  if (loading) {
    return (
      <div className="page-container loading-container">
        <h2 style={{ color: '#a3a3a3' }}>Loading applicant dashboard...</h2>
      </div>
    );
  }

  return (
    <div className="page-container">
      
      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="section-title" style={{ fontSize: '1.8rem', margin: 0 }}>
          Applicant Dashboard — Welcome{user?.name ? `, ${user.name}` : ''}
        </h1>
      </div>

      {error && (
        <div style={{ padding: '1rem', marginBottom: '1.5rem', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '0.375rem' }}>
          {error}
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="dashboard-tabs">
        <button 
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`tab-btn ${activeTab === 'applications' ? 'active' : ''}`}
          onClick={() => setActiveTab('applications')}
        >
          My Applications ({applications.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'saved' ? 'active' : ''}`}
          onClick={() => setActiveTab('saved')}
        >
          Saved Jobs ({savedJobs.length})
        </button>
      </div>

      {/* Main Content Area  */}
      {activeTab === 'overview' && (
        <>
          {/* Stats Overview Grid */}
          <h2 className="section-title" style={{ fontSize: '1.25rem' }}>Application Status Overview</h2>
          <div className="stats-grid">
            
            {/* Pending Card */}
            <div className="stat-card" style={{ backgroundColor: '#fffbeb', border: '1px solid #fef3c7' }}>
              <div>
                <h2 className="stat-value" style={{ color: '#d97706' }}>{stats.pending}</h2>
                <p className="stat-label" style={{ color: '#b45309' }}>Pending Review</p>
              </div>
            </div>

            {/* Interviews Card */}
            <div className="stat-card" style={{ backgroundColor: '#eff6ff', border: '1px solid #cfe2ff' }}>
              <div>
                <h2 className="stat-value" style={{ color: '#2563eb' }}>{stats.interviews}</h2>
                <p className="stat-label" style={{ color: '#1d4ed8' }}>Interviews Scheduled</p>
              </div>
            </div>

            {/* Accepted Card */}
            <div className="stat-card green">
              <div>
                <h2 className="stat-value">{stats.accepted}</h2>
                <p className="stat-label">Jobs Accepted</p>
              </div>
            </div>

            {/* Rejected Card */}
            <div className="stat-card red">
              <div>
                <h2 className="stat-value">{stats.rejected}</h2>
                <p className="stat-label">Applications Rejected</p>
              </div>
            </div>
          </div>

          {/* 2-Column Dashboard Grid */}
          <div className="dashboard-grid">
            
            {/* Left Column: Applications Table */}
            <div>
              <h2 className="section-title" style={{ fontSize: '1.25rem' }}>My Applications (Recent)</h2>
              <div className="job-table-container">
                {applications.length > 0 ? (
                  <table className="job-table">
                    <thead>
                      <tr>
                        <th>Job Title / Company</th>
                        <th>Location</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applications.slice(0, 5).map(app => (
                        <tr key={app.app_id}>
                          <td>
                            <p className="job-title-text">{app.job_title || `Job #${app.job_id}`}</p>
                            <p className="job-location-text">{app.company_name || `Company #${app.company_id}`}</p>
                          </td>
                          <td style={{ color: '#4b5563', fontSize: '0.9rem' }}>{app.job_location || 'N/A'}</td>
                          <td>
                            <span className={`status-badge ${getStatusClass(app.status)}`}>
                              {formatStatus(app.status)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p style={{ padding: '1.5rem', color: '#6b7280', margin: 0 }}>
                    You haven't submitted any job applications yet. Browse active job listings to get started!
                  </p>
                )}
              </div>
            </div>

            {/* Right Column: Saved Jobs */}
            <div>
              <h2 className="section-title" style={{ fontSize: '1.25rem' }}>Saved Jobs (Bookmarked)</h2>
              <div className="saved-listings-list">
                {savedJobs.length > 0 ? (
                  savedJobs.slice(0, 5).map(job => (
                    <div key={job.job_id || job.id} className="saved-card">
                      <div className="saved-job-info">
                        <h4 className="saved-job-title">{job.job_title || job.title}</h4>
                        <p className="saved-company">
                          {job.company_name || job.company}{job.job_location || job.location ? ` • ${job.job_location || job.location}` : ''}
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <button 
                          className="primary-btn"
                          style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem' }}
                          onClick={() => navigate(`/jobs/${job.job_id || job.id}`)}
                        >
                          Apply
                        </button>
                        <button 
                          className="secondary-btn"
                          style={{ color: '#ef4444', borderColor: '#fca5a5', padding: '0.4rem 0.85rem', fontSize: '0.85rem' }}
                          onClick={() => handleRemoveSaved(job.job_id || job.id)}
                          title="Unfavourite Job"
                        >
                          Unfavourite
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p style={{ padding: '1.5rem', color: '#6b7280', margin: 0, backgroundColor: '#fff', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                    No bookmarked jobs saved.
                  </p>
                )}
              </div>
            </div>

          </div>
        </>
      )}

      {/* Full Applications Tab */}
      {activeTab === 'applications' && (
        <div className="job-table-container">
          {applications.length > 0 ? (
            <table className="job-table">
              <thead>
                <tr>
                  <th>Job Title / Company</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {applications.map(app => (
                  <tr key={app.app_id}>
                    <td>
                      <p className="job-title-text">{app.job_title || `Job #${app.job_id}`}</p>
                      <p className="job-location-text">{app.company_name || `Company #${app.company_id}`}</p>
                    </td>
                    <td style={{ color: '#4b5563', fontSize: '0.9rem' }}>{app.job_location || 'N/A'}</td>
                    <td>
                      <span className={`status-badge ${getStatusClass(app.status)}`}>
                        {formatStatus(app.status)}
                      </span>
                    </td>
                    <td>
                      <button 
                        className="secondary-btn"
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.85rem' }}
                        onClick={() => navigate(`/jobs/${app.job_id}`)}
                      >
                        View Job
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="base-card" style={{ padding: '2rem', textAlign: 'center' }}>
              <p style={{ color: '#6b7280' }}>You have not submitted any applications yet.</p>
              <button className="primary-btn" onClick={() => navigate('/jobs')}>
                Browse Jobs
              </button>
            </div>
          )}
        </div>
      )}

      {/* Full Saved Jobs Tab */}
      {activeTab === 'saved' && (
        <div>
          {savedJobs.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {savedJobs.map(job => (
                <div key={job.job_id || job.id} className="saved-card" style={{ padding: '1.25rem', backgroundColor: '#fff', borderRadius: '0.5rem', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div className="saved-job-info">
                    <h4 className="saved-job-title" style={{ fontSize: '1.1rem', margin: '0 0 0.25rem 0' }}>{job.job_title || job.title}</h4>
                    <p className="saved-company" style={{ color: '#475569', margin: 0 }}>
                      {job.company_name || job.company}{job.job_location || job.location ? ` • ${job.job_location || job.location}` : ''}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                      className="primary-btn"
                      onClick={() => navigate(`/jobs/${job.job_id || job.id}`)}
                    >
                      View & Apply
                    </button>
                    <button 
                      className="secondary-btn"
                      style={{ color: '#ef4444', borderColor: '#fca5a5' }}
                      onClick={() => handleRemoveSaved(job.job_id || job.id)}
                      title="Unfavourite Job"
                    >
                      Unfavourite
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="base-card" style={{ padding: '2rem', textAlign: 'center' }}>
              <p style={{ color: '#6b7280' }}>You have no bookmarked jobs.</p>
              <button className="primary-btn" onClick={() => navigate('/jobs')}>
                Explore Opportunities
              </button>
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default CandidateDashboard;