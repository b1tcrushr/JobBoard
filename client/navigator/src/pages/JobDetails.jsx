import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import "../styles/job.css";
import { saveJob } from "../hooks/savedJobs";
import { api } from '../api/apiClient';
import { useAuth } from '../context/AuthContext.jsx';

const JobDetails = () => {
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [jobData, setJobData] = useState(null);
  const [hasApplied, setHasApplied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const jobId = parseInt(id);

    Promise.all([
      api.post("/api/jobs/get", { job_id: jobId }),
      user?.id ? api.get(`/api/applications/user/${user.id}`).catch(() => []) : Promise.resolve([])
    ])
      .then(([job, userApps]) => {
        setJobData(job);
        if (Array.isArray(userApps) && userApps.some(a => a.job_id === jobId)) {
          setHasApplied(true);
        }
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id, user]);

  const handleSaveClick = () => {
    if (user?.role === 'employer') {
      alert("Employer accounts cannot save or favourite job listings.");
      return;
    }
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    saveJob({ job_id: jobData.job_id, job_title: jobData.job_title, company_name: jobData.company_name });
    setSaved(true);
  };

  const handleApplyClick = () => {
    if (jobData?.job_status?.toLowerCase() === 'closed') {
      alert("This job posting is closed and no longer accepts applications.");
      return;
    }
    if (user?.role === 'employer') {
      alert("Employer accounts cannot apply to job postings.");
      return;
    }
    if (!user) {
      setShowAuthModal(true);
    } else {
      navigate(`/apply`, { state: { job: jobData } });
    }
  };

  if (loading) {
    return (
      <div className="page-container loading-container">
        <h2 style={{ color: '#a3a3a3' }}>Loading job details...</h2>
      </div>
    );
  }

  if (error || !jobData) {
    return (
      <div className="page-container loading-container">
        <h2 style={{ color: '#a3a3a3' }}>{error || "Job not found"}</h2>
      </div>
    );
  }

  const isEmployer = user?.role === 'employer';
  const isClosed = jobData?.job_status?.toLowerCase() === 'closed';

  return (
    <div className="page-container">

      {/* Closed Job Notification Banner */}
      {isClosed && (
        <div style={{ padding: '1rem 1.5rem', marginBottom: '1.5rem', backgroundColor: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '0.5rem', color: '#991b1b', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.5rem' }}>🚫</span>
          <div>
            <strong style={{ fontSize: '1.05rem', display: 'block', marginBottom: '0.2rem' }}>Job Posting Closed</strong>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#b91c1c' }}>
              This position is marked as closed by the employer and is no longer accepting new applications.
            </p>
          </div>
        </div>
      )}

      {/* Top Header Card */}
      <div className="header-card">
        <div>
          <h1 className="job-title-main">{jobData.job_title}</h1>
          <p className="job-subtitle">{jobData.company_name} • {jobData.job_location}</p>
        </div>
        <div className="header-actions">
          {isClosed ? (
            <button className="secondary-btn" disabled style={{ backgroundColor: '#fee2e2', color: '#dc2626', borderColor: '#fca5a5', cursor: 'default', fontWeight: '600' }}>
              Posting Closed
            </button>
          ) : isEmployer ? (
            <div style={{ fontSize: '0.9rem', color: '#64748b', fontStyle: 'italic', padding: '0.5rem 1rem', backgroundColor: '#f1f5f9', borderRadius: '0.375rem', border: '1px solid #cbd5e1' }}>
              Employer View (Applying & favouriting disabled)
            </div>
          ) : (
            <>
              {hasApplied ? (
                <button className="secondary-btn" disabled style={{ backgroundColor: '#f0fdf4', color: '#16a34a', borderColor: '#bbf7d0', cursor: 'default', fontWeight: '600' }}>
                  ✓ Already Applied
                </button>
              ) : (
                <button className="primary-btn" onClick={handleApplyClick}>Apply Now</button>
              )}
              <button className="secondary-btn" onClick={handleSaveClick} disabled={saved}>
                {saved ? "✓ Saved" : "★ Save Job"}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Two-Column Grid */}
      <div className="content-grid">

        {/* Left Column: Job Details */}
        <div className="main-column">
          <section>
            <h2 className="section-heading">Job Description</h2>
            <p className="paragraph">{jobData.job_description}</p>
          </section>

          <section>
            <h2 className="section-heading">Requirements</h2>
            <p className="paragraph">{jobData.requirements}</p>
          </section>

          <section>
            <h2 className="section-heading">Roles & Responsibilities</h2>
            <p className="paragraph">{jobData.responsibilities}</p>
          </section>
        </div>

        {/* Right Column: Sidebar */}
        <div className="sidebar-column">

          <div className="sidebar-card-green">
            <h3 className="sidebar-heading">Salary & Benefits</h3>
            <p className="salary-text">{jobData.pay_grade}</p>
            <p className="paragraph">{jobData.benefits}</p>
          </div>

          <div className="sidebar-card">
            <h3 className="sidebar-heading">About {jobData.company_name}</h3>
            <p className="paragraph">{jobData.company_description || "Innovative employer committed to building world-class products and career growth opportunities."}</p>
            <div className="company-meta">
              <p><strong>Size:</strong> {jobData.company_size || "Not specified"}</p>
              <p><strong>Industry:</strong> {jobData.industry || "Technology"}</p>
              <p><strong>Website:</strong> {jobData.company_website ? (
                <a 
                  href={jobData.company_website.startsWith('http') ? jobData.company_website : `https://${jobData.company_website}`} 
                  target="_blank" 
                  rel="noreferrer"
                  style={{ color: '#2563eb', textDecoration: 'underline' }}
                >
                  {jobData.company_website}
                </a>
              ) : "Not specified"}</p>
            </div>
          </div>

        </div>
      </div>

      {/* Authentication State */}
      {showAuthModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="modal-title">Authentication Required</h2>
            <p className="modal-text">
              You are currently browsing as a guest. Please log in or register a new account to apply for this position.
            </p>
            <div className="modal-actions">
              <button
                className="primary-btn"
                onClick={() => navigate('/login')}
              >
                Login / Register
              </button>
              <button
                className="cancel-btn"
                onClick={() => setShowAuthModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default JobDetails;