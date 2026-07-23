import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../api/apiClient.js';
import "../styles/job.css";
import "../styles/adminDashboard.css";

const EmployerDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [employer, setEmployer] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [selectedJobFilter, setSelectedJobFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Resume Review Modal state
  const [selectedAppForReview, setSelectedAppForReview] = useState(null);

  // Edit Job Posting Modal state
  const [editingJob, setEditingJob] = useState(null);
  const [editFormData, setEditFormData] = useState({
    title: '',
    location: '',
    workType: 'Hybrid',
    jobType: 'FullTime',
    roleType: 'Full-Time',
    payGrade: 'Grade 1',
    experienceLevel: 'Mid-Level',
    description: '',
    requirements: '',
    responsibilities: '',
    benefits: '',
    status: 'open'
  });
  const [savingEdit, setSavingEdit] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchEmployerData = async () => {
    if (!user || !user.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 1. Get Employer profile by user_id
      const empData = await api.get(`/api/employers/user/${user.id}`);
      setEmployer(empData);

      if (empData && empData.employer_id) {
        // 2. Fetch jobs and applicants in parallel
        const [jobsData, appsData] = await Promise.all([
          api.get(`/api/jobs/employer/${empData.employer_id}`).catch(() => []),
          api.get(`/api/applications/employer/${empData.employer_id}`).catch(() => [])
        ]);

        setJobs(Array.isArray(jobsData) ? jobsData : []);
        setApplications(Array.isArray(appsData) ? appsData : []);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch employer dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployerData();
  }, [user]);

  const handleUpdateStatus = async (appId, newStatus) => {
    try {
      await api.patch(`/api/applications/${appId}`, { status: newStatus });
      // Refresh applications data
      if (employer?.employer_id) {
        const appsData = await api.get(`/api/applications/employer/${employer.employer_id}`);
        setApplications(Array.isArray(appsData) ? appsData : []);
        // Update currently opened review modal if open
        if (selectedAppForReview && selectedAppForReview.app_id === appId) {
          setSelectedAppForReview(prev => ({ ...prev, status: newStatus }));
        }
      }
    } catch (err) {
      alert(`Error updating application status: ${err.message}`);
    }
  };

  const handleCloseJob = async (jobId) => {
    if (!window.confirm("Are you sure you want to close this job posting? Closed jobs will no longer accept applications.")) {
      return;
    }
    try {
      await api.delete(`/api/jobs/${jobId}`);
      fetchEmployerData();
    } catch (err) {
      alert(`Error closing job: ${err.message}`);
    }
  };

  const handleReopenJob = async (jobId) => {
    if (!window.confirm("Are you sure you want to reopen this job posting? Reopened jobs will accept new applications.")) {
      return;
    }
    try {
      await api.patch(`/api/jobs/${jobId}/reopen`);
      fetchEmployerData();
    } catch (err) {
      alert(`Error reopening job: ${err.message}`);
    }
  };

  const handleDeleteJob = async (jobId, jobTitle) => {
    if (!window.confirm(`Are you sure you want to permanently delete job posting "${jobTitle}"? This will also remove any candidate applications associated with it.`)) {
      return;
    }
    try {
      await api.delete(`/api/jobs/permanent/${jobId}`);
      fetchEmployerData();
    } catch (err) {
      alert(`Error deleting job: ${err.message}`);
    }
  };

  const handleOpenEditModal = (job) => {
    setEditingJob(job);
    setEditFormData({
      title: job.job_title || '',
      location: job.job_location || '',
      workType: job.work_type || 'Remote',
      jobType: job.job_type || 'Full-Time',
      payGrade: job.pay_grade || 'Grade 1',
      experienceLevel: job.experience_level || 'Entry Level',
      description: job.job_description || '',
      requirements: job.requirements || '',
      responsibilities: job.responsibilities || '',
      benefits: job.benefits || '',
      status: job.job_status || 'open'
    });
  };

  const handleSaveEditJob = async (e) => {
    e.preventDefault();
    setSavingEdit(true);
    try {
      await api.patch(`/api/jobs/${editingJob.job_id}`, editFormData);
      setEditingJob(null);
      fetchEmployerData();
    } catch (err) {
      alert(`Error updating job posting: ${err.message}`);
    } finally {
      setSavingEdit(false);
    }
  };

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'accepted':
        return 'status-interview'; // Green badge
      case 'interview':
        return 'status-pending'; // Blue/purple badge
      case 'pending':
      case 'applied':
      case 'under review':
      case 'open':
        return 'status-pending'; // Yellow badge
      case 'closed':
      case 'rejected':
        return 'status-rejected'; // Red badge
      default:
        return '';
    }
  };

  const formatStatus = (status) => {
    if (!status) return 'Applied';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  // Filtered applications by selected job posting
  const filteredApplications = selectedJobFilter === 'all' 
    ? applications 
    : applications.filter(a => a.job_id === parseInt(selectedJobFilter));

  const stats = {
    review: applications.filter(a => ['applied', 'pending', 'under review'].includes(a.status?.toLowerCase())).length,
    interviews: applications.filter(a => a.status?.toLowerCase() === 'interview').length,
    accepted: applications.filter(a => a.status?.toLowerCase() === 'accepted').length,
    rejected: applications.filter(a => a.status?.toLowerCase() === 'rejected').length
  };

  // Map application counts to jobs
  const jobsWithApplicantCount = jobs.map(job => {
    const count = applications.filter(a => a.job_id === job.job_id).length;
    return {
      ...job,
      applicantCount: count
    };
  });

  if (loading) {
    return (
      <div className="page-container loading-container">
        <h2 style={{ color: '#a3a3a3' }}>Loading employer dashboard...</h2>
      </div>
    );
  }

  return (
    <div className="page-container">
      
      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="section-title" style={{ fontSize: '1.8rem', margin: 0 }}>
          Employer Dashboard — Welcome{user?.name ? `, ${user.name}` : ''}
        </h1>
        
        <button className="primary-btn" onClick={() => navigate('/post')} style={{ fontSize: '1rem', padding: '0.6rem 1.5rem' }}>
          + Post a Job
        </button>
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
          className={`tab-btn ${activeTab === 'my-jobs' ? 'active' : ''}`}
          onClick={() => setActiveTab('my-jobs')}
        >
          My Jobs ({jobs.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'talent' ? 'active' : ''}`}
          onClick={() => setActiveTab('talent')}
        >
          Applicants & Talent ({applications.length})
        </button>
      </div>

      {activeTab === 'overview' && (
        <>
          {/* Stats Overview Grid */}
          <h2 className="section-title" style={{ fontSize: '1.25rem' }}>Hiring Pipeline Overview</h2>
          <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
            
            {/* Candidates to Review */}
            <div className="stat-card" style={{ backgroundColor: '#fffbeb', border: '1px solid #fef3c7' }}>
              <div>
                <h2 className="stat-value" style={{ color: '#d97706' }}>{stats.review}</h2>
                <p className="stat-label" style={{ color: '#b45309' }}>Pending Review</p>
              </div>
            </div>

            {/* Interviews Scheduled */}
            <div className="stat-card" style={{ backgroundColor: '#eff6ff', border: '1px solid #dbeafe' }}>
              <div>
                <h2 className="stat-value" style={{ color: '#2563eb' }}>{stats.interviews}</h2>
                <p className="stat-label" style={{ color: '#1d4ed8' }}>Interviews</p>
              </div>
            </div>

            {/* Applications Accepted */}
            <div className="stat-card green">
              <div>
                <h2 className="stat-value">{stats.accepted}</h2>
                <p className="stat-label">Accepted</p>
              </div>
            </div>

            {/* Applications Rejected */}
            <div className="stat-card red">
              <div>
                <h2 className="stat-value">{stats.rejected}</h2>
                <p className="stat-label">Rejected</p>
              </div>
            </div>
          </div>

          {/* 2-Column Dashboard Grid */}
          <div className="dashboard-grid">
            
            {/* Left Column: Job Listings Table */}
            <div>
              <h2 className="section-title" style={{ fontSize: '1.25rem' }}>Job Listings (Recent)</h2>
              <div className="job-table-container">
                {jobsWithApplicantCount.length > 0 ? (
                  <table className="job-table">
                    <thead>
                      <tr>
                        <th>Job Title</th>
                        <th>Applicants</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {jobsWithApplicantCount.slice(0, 5).map(job => (
                        <tr key={job.job_id}>
                          <td>
                            <p className="job-title-text">{job.job_title}</p>
                            <p className="job-location-text">({job.job_location || 'Remote'})</p>
                          </td>
                          <td style={{ color: '#1a202c', fontWeight: '500' }}>
                            {job.applicantCount} Applicant{job.applicantCount === 1 ? '' : 's'}
                          </td>
                          <td>
                            <span className={`status-badge ${getStatusClass(job.job_status)}`}>
                              {formatStatus(job.job_status)}
                            </span>
                          </td>
                          <td>
                            <button 
                              className="secondary-btn"
                              style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}
                              onClick={() => handleOpenEditModal(job)}
                            >
                              Edit Posting
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p style={{ padding: '1.5rem', color: '#6b7280', margin: 0 }}>
                    You haven't posted any job listings yet. Click "+ Post a Job" to get started!
                  </p>
                )}
              </div>
            </div>

            {/* Right Column: Recent Applicants */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <h2 className="section-title" style={{ fontSize: '1.25rem' }}>Recent Applicants</h2>
              
              <div className="saved-listings-list" style={{ marginBottom: '1.5rem' }}>
                {applications.length > 0 ? (
                  applications.slice(0, 5).map(app => (
                    <div key={app.app_id} className="saved-card" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.75rem' }}>
                      <div className="saved-job-info" style={{ width: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <h4 className="saved-job-title">{app.candidate_name}</h4>
                          <span className={`status-badge ${getStatusClass(app.status)}`}>
                            {formatStatus(app.status)}
                          </span>
                        </div>
                        <p className="saved-company">{app.job_title} • {app.candidate_email}</p>
                      </div>
                      
                      {/* Action Buttons for Recent Applicant */}
                      <div style={{ display: 'flex', gap: '0.4rem', width: '100%', justifyContent: 'flex-end' }}>
                        <button 
                          className="primary-btn"
                          style={{ padding: '0.35rem 0.75rem', fontSize: '0.85rem' }}
                          onClick={() => setSelectedAppForReview(app)}
                        >
                          📄 Review Resume
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p style={{ padding: '1.5rem', color: '#6b7280', margin: 0, backgroundColor: '#fff', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                    No applicant submissions recorded yet.
                  </p>
                )}
              </div>

            </div>

          </div>
        </>
      )}

      {/* Full My Jobs Tab */}
      {activeTab === 'my-jobs' && (
        <div className="job-table-container">
          {jobsWithApplicantCount.length > 0 ? (
            <table className="job-table">
              <thead>
                <tr>
                  <th>Job Title / Details</th>
                  <th>Location</th>
                  <th>Type</th>
                  <th>Applicants</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobsWithApplicantCount.map(job => (
                  <tr key={job.job_id}>
                    <td>
                      <p className="job-title-text">{job.job_title}</p>
                      <p className="job-location-text">{job.pay_grade || 'Grade N/A'} • {job.work_type}</p>
                    </td>
                    <td style={{ color: '#4b5563', fontSize: '0.9rem' }}>{job.job_location || 'N/A'}</td>
                    <td style={{ color: '#4b5563', fontSize: '0.9rem' }}>{job.role_type || job.job_type}</td>
                    <td style={{ fontWeight: '600' }}>{job.applicantCount}</td>
                    <td>
                      <span className={`status-badge ${getStatusClass(job.job_status)}`}>
                        {formatStatus(job.job_status)}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                        <button 
                          className="secondary-btn"
                          style={{ padding: '0.35rem 0.75rem', fontSize: '0.85rem' }}
                          onClick={() => handleOpenEditModal(job)}
                        >
                          ✏️ Edit Posting
                        </button>
                        <button 
                          className="secondary-btn"
                          style={{ padding: '0.35rem 0.75rem', fontSize: '0.85rem' }}
                          onClick={() => {
                            setSelectedJobFilter(job.job_id.toString());
                            setActiveTab('talent');
                          }}
                        >
                          View Applicants ({job.applicantCount})
                        </button>
                        {job.job_status?.toLowerCase() !== 'closed' ? (
                          <button 
                            className="secondary-btn"
                            style={{ padding: '0.35rem 0.75rem', fontSize: '0.85rem', color: '#d97706', borderColor: '#fde68a' }}
                            onClick={() => handleCloseJob(job.job_id)}
                          >
                            Close Job
                          </button>
                        ) : (
                          <button 
                            className="secondary-btn"
                            style={{ padding: '0.35rem 0.75rem', fontSize: '0.85rem', color: '#16a34a', borderColor: '#86efac' }}
                            onClick={() => handleReopenJob(job.job_id)}
                          >
                            Reopen Job
                          </button>
                        )}
                        <button 
                          className="secondary-btn"
                          style={{ padding: '0.35rem 0.75rem', fontSize: '0.85rem', color: '#dc2626', borderColor: '#fca5a5', backgroundColor: '#fef2f2' }}
                          onClick={() => handleDeleteJob(job.job_id, job.job_title)}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="base-card" style={{ padding: '2rem', textAlign: 'center' }}>
              <p style={{ color: '#6b7280' }}>You have not posted any jobs yet.</p>
              <button className="primary-btn" onClick={() => navigate('/post')}>
                Create Job Posting
              </button>
            </div>
          )}
        </div>
      )}

      {/* Full Talent / Applicants Tab */}
      {activeTab === 'talent' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Per-Job Filter Toolbar */}
          <div className="base-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem' }}>
            <h2 className="section-title" style={{ fontSize: '1.25rem', margin: 0 }}>Applicants & Hiring Pipeline</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <label style={{ fontSize: '0.95rem', fontWeight: '600', color: '#475569' }}>Filter by Job Posting:</label>
              <select 
                className="form-select" 
                value={selectedJobFilter} 
                onChange={(e) => setSelectedJobFilter(e.target.value)}
                style={{ padding: '0.45rem 1rem', fontSize: '0.9rem', borderRadius: '0.375rem', borderColor: '#cbd5e1' }}
              >
                <option value="all">All Job Postings ({applications.length} Total Applicants)</option>
                {jobs.map(j => (
                  <option key={j.job_id} value={j.job_id}>
                    {j.job_title} ({applications.filter(a => a.job_id === j.job_id).length} Applicants)
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="job-table-container">
            {filteredApplications.length > 0 ? (
              <table className="job-table">
                <thead>
                  <tr>
                    <th>Candidate Name</th>
                    <th>Email</th>
                    <th>Job Title</th>
                    <th>Current Status</th>
                    <th>Review & Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApplications.map(app => (
                    <tr key={app.app_id}>
                      <td>
                        <p className="job-title-text">{app.candidate_name}</p>
                      </td>
                      <td style={{ color: '#4b5563', fontSize: '0.9rem' }}>{app.candidate_email}</td>
                      <td>
                        <p className="job-title-text" style={{ fontSize: '0.9rem' }}>{app.job_title}</p>
                        <p className="job-location-text">{app.job_location}</p>
                      </td>
                      <td>
                        <span className={`status-badge ${getStatusClass(app.status)}`}>
                          {formatStatus(app.status)}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                          <button 
                            className="primary-btn"
                            style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}
                            onClick={() => setSelectedAppForReview(app)}
                          >
                            📄 Review Resume
                          </button>
                          <button 
                            className="secondary-btn"
                            style={{ 
                              padding: '0.3rem 0.6rem', 
                              fontSize: '0.8rem', 
                              color: '#d97706', 
                              borderColor: '#fde68a',
                              backgroundColor: app.status?.toLowerCase() === 'under review' ? '#fef3c7' : '' 
                            }}
                            onClick={() => handleUpdateStatus(app.app_id, 'under review')}
                          >
                            Under Review
                          </button>
                          <button 
                            className="secondary-btn"
                            style={{ 
                              padding: '0.3rem 0.6rem', 
                              fontSize: '0.8rem', 
                              color: '#16a34a', 
                              borderColor: '#86efac',
                              backgroundColor: app.status?.toLowerCase() === 'accepted' ? '#dcfce7' : '' 
                            }}
                            onClick={() => handleUpdateStatus(app.app_id, 'accepted')}
                          >
                            Accept
                          </button>
                          <button 
                            className="secondary-btn"
                            style={{ 
                              padding: '0.3rem 0.6rem', 
                              fontSize: '0.8rem', 
                              color: '#2563eb', 
                              borderColor: '#93c5fd',
                              backgroundColor: app.status?.toLowerCase() === 'interview' ? '#dbeafe' : '' 
                            }}
                            onClick={() => handleUpdateStatus(app.app_id, 'interview')}
                          >
                            Interview
                          </button>
                          <button 
                            className="secondary-btn"
                            style={{ 
                              padding: '0.3rem 0.6rem', 
                              fontSize: '0.8rem', 
                              color: '#dc2626', 
                              borderColor: '#fca5a5',
                              backgroundColor: app.status?.toLowerCase() === 'rejected' ? '#fee2e2' : '' 
                            }}
                            onClick={() => handleUpdateStatus(app.app_id, 'rejected')}
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="base-card" style={{ padding: '2rem', textAlign: 'center' }}>
                <p style={{ color: '#6b7280' }}>
                  {selectedJobFilter === 'all' 
                    ? "No applicants in your hiring pipeline yet."
                    : "No applicants have submitted applications for this specific job posting."}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Review Resume Modal */}
      {selectedAppForReview && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '650px', width: '90%', maxHeight: '85vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
              <div>
                <h2 className="modal-title" style={{ margin: 0 }}>Candidate Application Review</h2>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>
                  Applied for <strong>{selectedAppForReview.job_title}</strong>
                </p>
              </div>
              <span className={`status-badge ${getStatusClass(selectedAppForReview.status)}`}>
                {formatStatus(selectedAppForReview.status)}
              </span>
            </div>

            <div style={{ marginBottom: '1.25rem', backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
              <p style={{ margin: '0 0 0.4rem 0', fontSize: '0.95rem' }}><strong>Candidate Name:</strong> {selectedAppForReview.candidate_name}</p>
              <p style={{ margin: 0, fontSize: '0.95rem' }}><strong>Email Address:</strong> <a href={`mailto:${selectedAppForReview.candidate_email}`} style={{ color: '#2563eb' }}>{selectedAppForReview.candidate_email}</a></p>
            </div>

            {/* Submitted Resume Text */}
            <div style={{ marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1rem', color: '#1e293b', marginBottom: '0.5rem' }}>Submitted Resume / Profile:</h3>
              {selectedAppForReview.resume_text ? (
                <div style={{ 
                  backgroundColor: '#ffffff', 
                  border: '1px solid #cbd5e1', 
                  borderRadius: '0.375rem', 
                  padding: '1rem', 
                  fontSize: '0.9rem', 
                  color: '#334155', 
                  whiteSpace: 'pre-wrap',
                  maxHeight: '250px',
                  overflowY: 'auto',
                  lineHeight: '1.5'
                }}>
                  {selectedAppForReview.resume_text}
                </div>
              ) : (
                <p style={{ color: '#94a3b8', fontStyle: 'italic', margin: 0 }}>No resume text provided by candidate.</p>
              )}
            </div>

            {/* Cover Letter */}
            {selectedAppForReview.cover_letter && (
              <div style={{ marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1rem', color: '#1e293b', marginBottom: '0.5rem' }}>Cover Letter:</h3>
                <div style={{ 
                  backgroundColor: '#ffffff', 
                  border: '1px solid #cbd5e1', 
                  borderRadius: '0.375rem', 
                  padding: '1rem', 
                  fontSize: '0.9rem', 
                  color: '#334155', 
                  whiteSpace: 'pre-wrap',
                  maxHeight: '150px',
                  overflowY: 'auto',
                  lineHeight: '1.5'
                }}>
                  {selectedAppForReview.cover_letter}
                </div>
              </div>
            )}

            {/* Status Actions inside modal */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  className="secondary-btn" 
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', color: '#d97706', borderColor: '#fde68a', backgroundColor: selectedAppForReview.status?.toLowerCase() === 'under review' ? '#fef3c7' : '' }}
                  onClick={() => handleUpdateStatus(selectedAppForReview.app_id, 'under review')}
                >
                  Under Review
                </button>
                <button 
                  className="secondary-btn" 
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', color: '#16a34a', borderColor: '#86efac', backgroundColor: selectedAppForReview.status?.toLowerCase() === 'accepted' ? '#dcfce7' : '' }}
                  onClick={() => handleUpdateStatus(selectedAppForReview.app_id, 'accepted')}
                >
                  Accept
                </button>
                <button 
                  className="secondary-btn" 
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', color: '#2563eb', borderColor: '#93c5fd', backgroundColor: selectedAppForReview.status?.toLowerCase() === 'interview' ? '#dbeafe' : '' }}
                  onClick={() => handleUpdateStatus(selectedAppForReview.app_id, 'interview')}
                >
                  Interview
                </button>
                <button 
                  className="secondary-btn" 
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', color: '#dc2626', borderColor: '#fca5a5', backgroundColor: selectedAppForReview.status?.toLowerCase() === 'rejected' ? '#fee2e2' : '' }}
                  onClick={() => handleUpdateStatus(selectedAppForReview.app_id, 'rejected')}
                >
                  Reject
                </button>
              </div>

              <button 
                className="cancel-btn"
                onClick={() => setSelectedAppForReview(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Job Posting Modal */}
      {editingJob && (
        <div className="admin-modal-overlay" onClick={() => setEditingJob(null)}>
          <div className="admin-modal-card" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>Edit Job Posting #{editingJob.job_id}</h2>
              <button className="admin-modal-close" onClick={() => setEditingJob(null)}>✕</button>
            </div>

            <form onSubmit={handleSaveEditJob} className="admin-modal-form">
              <label>
                Job Title
                <input 
                  type="text" 
                  value={editFormData.title} 
                  onChange={e => setEditFormData({ ...editFormData, title: e.target.value })}
                  required 
                />
              </label>

              <div className="admin-modal-row">
                <label>
                  Location
                  <input 
                    type="text" 
                    value={editFormData.location} 
                    onChange={e => setEditFormData({ ...editFormData, location: e.target.value })}
                    required 
                  />
                </label>

                <label>
                  Status
                  <select 
                    value={editFormData.status} 
                    onChange={e => setEditFormData({ ...editFormData, status: e.target.value })}
                  >
                    <option value="open">Open (Hiring)</option>
                    <option value="closed">Closed</option>
                  </select>
                </label>
              </div>

              <div className="admin-modal-row">
                <label>
                  Work Type
                  <select 
                    value={editFormData.workType} 
                    onChange={e => setEditFormData({ ...editFormData, workType: e.target.value })}
                  >
                    <option value="Remote">Remote</option>
                    <option value="On-site">On-site</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </label>

                <label>
                  Job Type
                  <select 
                    value={editFormData.jobType} 
                    onChange={e => setEditFormData({ ...editFormData, jobType: e.target.value })}
                  >
                    <option value="Full-Time">Full-Time</option>
                    <option value="Part-Time">Part-Time</option>
                    <option value="Co-op">Co-op</option>
                    <option value="Contract">Contract</option>
                  </select>
                </label>
              </div>

              <div className="admin-modal-row">
                <label>
                  Experience Level
                  <select 
                    value={editFormData.experienceLevel} 
                    onChange={e => setEditFormData({ ...editFormData, experienceLevel: e.target.value })}
                  >
                    <option value="Entry Level">Entry Level</option>
                    <option value="3+ Years">3+ Years</option>
                    <option value="5+ Years">5+ Years</option>
                  </select>
                </label>

                <label>
                  Pay Grade
                  <select 
                    value={editFormData.payGrade} 
                    onChange={e => setEditFormData({ ...editFormData, payGrade: e.target.value })}
                  >
                    <option value="Grade 1">Grade 1</option>
                    <option value="Grade 2">Grade 2</option>
                    <option value="Grade 3">Grade 3</option>
                    <option value="Grade 4">Grade 4</option>
                  </select>
                </label>
              </div>

              <label>
                Description
                <textarea 
                  value={editFormData.description} 
                  onChange={e => setEditFormData({ ...editFormData, description: e.target.value })}
                  rows="3" 
                  required 
                />
              </label>

              <label>
                Requirements
                <textarea 
                  value={editFormData.requirements} 
                  onChange={e => setEditFormData({ ...editFormData, requirements: e.target.value })}
                  rows="2" 
                />
              </label>

              <label>
                Responsibilities
                <textarea 
                  value={editFormData.responsibilities} 
                  onChange={e => setEditFormData({ ...editFormData, responsibilities: e.target.value })}
                  rows="2" 
                />
              </label>

              <label>
                Benefits
                <textarea 
                  value={editFormData.benefits} 
                  onChange={e => setEditFormData({ ...editFormData, benefits: e.target.value })}
                  rows="2" 
                />
              </label>

              <div className="admin-modal-actions" style={{ justifyContent: 'space-between' }}>
                <button 
                  type="button" 
                  className="admin-action-btn"
                  style={{ color: '#dc2626', borderColor: '#fca5a5', backgroundColor: '#fef2f2' }}
                  onClick={() => {
                    const jId = editingJob.job_id;
                    const jTitle = editingJob.job_title;
                    setEditingJob(null);
                    handleDeleteJob(jId, jTitle);
                  }}
                >
                  🗑️ Delete Job
                </button>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button 
                    type="button" 
                    className="admin-action-btn"
                    onClick={() => setEditingJob(null)}
                    disabled={savingEdit}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="common-button" 
                    style={{ padding: "0.6rem 1.5rem" }}
                    disabled={savingEdit}
                  >
                    {savingEdit ? 'Saving...' : 'Save Job Posting'}
                  </button>
                </div>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default EmployerDashboard;