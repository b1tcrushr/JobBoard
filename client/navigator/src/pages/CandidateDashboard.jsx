import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "../styles/job.css";

const CandidateDashboard = () => {

  const [activeTab, setActiveTab] = useState('overview');

  const navigate = useNavigate();

  const stats = {
    pending: 3,
    interviews: 1,
    rejected: 2
  };

  const recentApplications = [
    {
      id: 1,
      title: 'Catalog Enrichment Analyst',
      company: 'DataSolutions Inc.',
      date: 'Oct 24, 2026',
      status: 'Pending'
    },
    {
      id: 2,
      title: 'Full Stack Engineer',
      company: 'CloudScale Systems',
      date: 'Oct 20, 2026',
      status: 'Interview'
    },
    {
      id: 3,
      title: 'UI/UX Designer',
      company: 'Creative Studio',
      date: 'Oct 15, 2026',
      status: 'Rejected'
    }
  ];

  const savedJobs = [
    {
      id: 101,
      title: 'DevOps Engineer (Fall 2026 Co-op)',
      company: 'Global CyberSec',
      location: 'Remote',
      savedAgo: '2 days ago'
    },
    {
      id: 102,
      title: 'Product Manager',
      company: 'Fintech Innovators',
      location: 'New York, NY',
      savedAgo: '5 days ago'
    }
  ];

  const getStatusClass = (status) => {
    switch (status) {
      case 'Pending': return 'status-pending';
      case 'Interview': return 'status-interview';
      case 'Rejected': return 'status-rejected';
      default: return '';
    }
  };

  return (
    <div className="page-container">
      
      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="section-title" style={{ fontSize: '1.8rem', margin: 0 }}>
          Applicant Dashboard — Welcome
        </h1>

        <button className="secondary-btn" onClick={() => navigate('/edashboard')}>
            Switch to Employer View
        </button>
      </div>

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
          My Applications
        </button>
        <button 
          className={`tab-btn ${activeTab === 'saved' ? 'active' : ''}`}
          onClick={() => setActiveTab('saved')}
        >
          Saved Jobs
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
            <div className="stat-card green">
              <div>
                <h2 className="stat-value">{stats.interviews}</h2>
                <p className="stat-label">Interviews Scheduled</p>
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
                <table className="job-table">
                  <thead>
                    <tr>
                      <th>Job Title / Company</th>
                      <th>Date Applied</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentApplications.map(app => (
                      <tr key={app.id}>
                        <td>
                          <p className="job-title-text">{app.title}</p>
                          <p className="job-location-text">{app.company}</p>
                        </td>
                        <td style={{ color: '#4b5563', fontSize: '0.9rem' }}>{app.date}</td>
                        <td>
                          <span className={`status-badge ${getStatusClass(app.status)}`}>
                            {app.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right Column: Saved Jobs */}
            <div>
              <h2 className="section-title" style={{ fontSize: '1.25rem' }}>Saved Jobs (Bookmarked)</h2>
              <div className="saved-listings-list">
                {savedJobs.map(job => (
                  <div key={job.id} className="saved-card">
                    <div className="saved-job-info">
                      <h4 className="saved-job-title">{job.title}</h4>
                      <p className="saved-company">{job.company} • {job.location}</p>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                        Saved {job.savedAgo}
                      </p>
                    </div>
                    <button className="primary-btn">Apply</button>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </>
      )}

      {/* Stubs for the other tabs */}
      {activeTab === 'applications' && (
        <div className="base-card">
          <p>Full application history will appear here.</p>
        </div>
      )}

      {activeTab === 'saved' && (
        <div className="base-card">
          <p>Full list of bookmarked jobs will appear here.</p>
        </div>
      )}

    </div>
  );
};

export default CandidateDashboard;