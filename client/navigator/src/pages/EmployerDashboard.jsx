import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "../styles/job.css";

const EmployerDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const navigate = useNavigate();

  const stats = {
    review: 15,
    interviews: 7,
    rejected: 3
  };

  const recentJobs = [
    {
      id: 1,
      title: 'Senior React Developer',
      location: 'Remote',
      applicants: '4 Applicants',
      status: 'Open'
    },
    {
      id: 2,
      title: 'Product Manager',
      location: 'New York',
      applicants: '2 Applicants',
      status: 'Pending'
    },
    {
      id: 3,
      title: 'UI/UX Designer',
      location: 'Full Time',
      applicants: '9 Applicants',
      status: 'Closed'
    }
  ];

  const shortlistedTalent = [
    {
      id: 101,
      name: 'John Doe',
      role: 'Senior Frontend Engineer • 8+ Yrs Exp',
      shortlistedAgo: 'Shortlisted 1 day ago',
      action: 'Schedule Interview'
    },
    {
      id: 102,
      name: 'Jane Smith',
      role: 'UX/UI Lead • 6+ Yrs Exp',
      shortlistedAgo: 'Shortlisted 3 days ago',
      action: 'View Profile'
    }
  ];

  const getStatusClass = (status) => {
    switch (status) {
      case 'Open': return 'status-interview';
      case 'Pending': return 'status-pending'; 
      case 'Closed': return 'status-rejected'; 
      default: return '';
    }
  };

  return (
    <div className="page-container">
      
      {/* Header Section with the Toggle Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="section-title" style={{ fontSize: '1.8rem', margin: 0 }}>
          Employer Dashboard — Welcome, Andrew (Hiring Manager)
        </h1>
        
        {/* THE SWITCH BUTTON */}
        <button className="secondary-btn" onClick={() => navigate('/dashboard')}>
            Switch to Candidate View
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
          className={`tab-btn ${activeTab === 'my-jobs' ? 'active' : ''}`}
          onClick={() => setActiveTab('my-jobs')}
        >
          My Jobs
        </button>
        <button 
          className={`tab-btn ${activeTab === 'talent' ? 'active' : ''}`}
          onClick={() => setActiveTab('talent')}
        >
          Shortlisted Talent
        </button>
      </div>

      {activeTab === 'overview' && (
        <>
          {/* Stats Overview Grid */}
          <h2 className="section-title" style={{ fontSize: '1.25rem' }}>Hiring Pipeline Overview</h2>
          <div className="stats-grid">
            
            {/* Candidates to Review */}
            <div className="stat-card" style={{ backgroundColor: '#fffbeb', border: '1px solid #fef3c7' }}>
              <div>
                <h2 className="stat-value" style={{ color: '#d97706' }}>{stats.review}</h2>
                <p className="stat-label" style={{ color: '#b45309' }}>Candidates to Review</p>
              </div>
            </div>

            {/* Interviews Scheduled */}
            <div className="stat-card green">
              <div>
                <h2 className="stat-value">{stats.interviews}</h2>
                <p className="stat-label">Interviews Scheduled</p>
              </div>
            </div>

            {/* Applications Rejected */}
            <div className="stat-card red">
              <div>
                <h2 className="stat-value">{stats.rejected}</h2>
                <p className="stat-label">Applications Rejected</p>
              </div>
            </div>
          </div>

          {/* 2-Column Dashboard Grid */}
          <div className="dashboard-grid">
            
            {/* Left Column: Job Listings Table */}
            <div>
              <h2 className="section-title" style={{ fontSize: '1.25rem' }}>Job Listings (Recent)</h2>
              <div className="job-table-container">
                <table className="job-table">
                  <thead>
                    <tr>
                      <th>Job Title</th>
                      <th>Applicants</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentJobs.map(job => (
                      <tr key={job.id}>
                        <td>
                          <p className="job-title-text">{job.title}</p>
                          <p className="job-location-text">({job.location})</p>
                        </td>
                        <td style={{ color: '#1a202c', fontWeight: '500' }}>{job.applicants}</td>
                        <td>
                          <span className={`status-badge ${getStatusClass(job.status)}`}>
                            {job.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right Column: Shortlisted Talent */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <h2 className="section-title" style={{ fontSize: '1.25rem' }}>Recent Talent (Shortlisted)</h2>
              
              <div className="saved-listings-list" style={{ marginBottom: '1.5rem' }}>
                {shortlistedTalent.map(talent => (
                  <div key={talent.id} className="saved-card">
                    <div className="saved-job-info">
                      <h4 className="saved-job-title">{talent.name}</h4>
                      <p className="saved-company">{talent.role}</p>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                        {talent.shortlistedAgo}
                      </p>
                    </div>
                    <button className="secondary-btn" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                      {talent.action}
                    </button>
                  </div>
                ))}
              </div>

              {/* + Post a Job Button */}
              <div style={{ alignSelf: 'flex-end' }}>
                <button className="primary-btn" onClick={() => navigate('/post')} style={{ fontSize: '1.1rem', padding: '0.75rem 2rem' }}>
                  + Post a Job
                </button>
              </div>
            </div>

          </div>
        </>
      )}

      {activeTab === 'my-jobs' && (
        <div className="base-card"><p>Full list of your posted jobs will appear here.</p></div>
      )}

      {activeTab === 'talent' && (
        <div className="base-card"><p>Your complete talent pipeline will appear here.</p></div>
      )}

    </div>
  );
};

export default EmployerDashboard;