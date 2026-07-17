import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import "../styles/job.css"
import { saveJob, isJobSaved } from "../hooks/savedJobs"
import { api } from '../api/apiClient';

const JobDetails = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [jobData, setJobData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    api.post("/api/jobs/get", { job_id: parseInt(id) })
      .then(setJobData)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSaveClick = () => {
    saveJob({ job_id: jobData.job_id, job_title: jobData.job_title, company_name: jobData.company_name });
    setSaved(true);
  };

  const handleApplyClick = () => {
    const isGuest = false;

    if (isGuest) {
      setShowAuthModal(true);
    } else {
      navigate(`/apply`);
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

  return (
    <div className="page-container">

      {/* Top Header Card */}
      <div className="header-card">
        <div>
          <h1 className="job-title-main">{jobData.job_title}</h1>
          <p className="job-subtitle">{jobData.company_name} • {jobData.job_location}</p>
        </div>
        <div className="header-actions">
          <button className="primary-btn" onClick={handleApplyClick}>Apply Now</button>
          <button className="secondary-btn" onClick={handleSaveClick} disabled={saved}>
            {saved ? "✓ Saved" : "★ Save Job"}
          </button>
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
            <p className="paragraph">{jobData.company_description}</p>
            <div className="company-meta">
              <p><strong>Size:</strong> {jobData.company_size}</p>
              <p><strong>Industry:</strong> {jobData.industry}</p>
              <p><strong>Website:</strong> {jobData.company_website}</p>
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