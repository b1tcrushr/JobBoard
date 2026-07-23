import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../api/apiClient.js";
import "../styles/applyJob.css";

function ApplyJob() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const queryJobId = new URLSearchParams(location.search).get("job_id");
  const [selectedJob, setSelectedJob] = useState(location.state?.job || null);
  const [fetchingJob, setFetchingJob] = useState(!location.state?.job && !!queryJobId);

  useEffect(() => {
    if (!selectedJob && queryJobId) {
      setFetchingJob(true);
      api.get(`/api/jobs/${queryJobId}`)
        .then(job => setSelectedJob(job))
        .catch(() => setSelectedJob(null))
        .finally(() => setFetchingJob(false));
    }
  }, [queryJobId, selectedJob]);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    resumeText: "",
    coverLetter: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      const nameParts = (user.name || "").trim().split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";
      setFormData(prev => ({
        ...prev,
        firstName,
        lastName,
        email: user.email || "",
        phone: user.phone || prev.phone || ""
      }));

      if (user.id) {
        api.get(`/api/users/${user.id}`)
          .then(uData => {
            if (uData && uData.phone) {
              setFormData(prev => ({
                ...prev,
                phone: uData.phone
              }));
            }
          })
          .catch(() => {});
      }

      const jobId = selectedJob?.job_id || selectedJob?.id;
      if (jobId && user.id) {
        api.get(`/api/applications/user/${user.id}`)
          .then(apps => {
            if (Array.isArray(apps) && apps.some(a => a.job_id === parseInt(jobId))) {
              setAlreadyApplied(true);
            }
          })
          .catch(() => {});
      }
    }
  }, [user, selectedJob]);

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!selectedJob) return;
    setError("");
    setSubmitting(true);

    const jobId = selectedJob.job_id || selectedJob.id;

    try {
      await api.post("/api/applications/create", {
        job_id: jobId,
        company_id: selectedJob.company_id,
        user_id: user.id,
        resume_text: formData.resumeText,
        cover_letter: formData.coverLetter
      });
      setSubmitted(true);
    } catch (err) {
      setError(err.message || "Failed to submit application.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!user) {
    return (
      <div className="apply-container" style={{ textAlign: "center", padding: "3rem 1rem" }}>
        <div className="apply-form-card" style={{ maxWidth: "500px", margin: "2rem auto", padding: "2rem" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔒</div>
          <h2 style={{ fontSize: "1.5rem", color: "#1e293b", marginBottom: "0.5rem" }}>Authentication Required</h2>
          <p style={{ fontSize: "1rem", color: "#64748b", marginBottom: "1.5rem" }}>
            You are currently browsing as a guest. Please sign in or register an account to apply for job postings.
          </p>
          <Link to="/login">
            <button className="common-button" style={{ padding: "0.75rem 2rem", fontSize: "1rem" }}>
              Sign In / Register
            </button>
          </Link>
        </div>
      </div>
    );
  }

  if (user.role !== 'candidate') {
    return (
      <div className="apply-container" style={{ textAlign: "center", padding: "3rem 1rem" }}>
        <div className="apply-form-card" style={{ maxWidth: "500px", margin: "2rem auto", padding: "2rem" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🚫</div>
          <h2 style={{ fontSize: "1.5rem", color: "#1e293b", marginBottom: "0.5rem" }}>
            {user.role === 'admin' ? "Admin Account" : "Employer Account"}
          </h2>
          <p style={{ fontSize: "1rem", color: "#64748b", marginBottom: "1.5rem" }}>
            {user.role === 'admin'
              ? "Admin accounts cannot apply to job postings."
              : "Employer accounts cannot apply to job postings."}
          </p>
          <Link to="/">
            <button className="common-button" style={{ padding: "0.75rem 2rem", fontSize: "1rem" }}>
              Back to Home
            </button>
          </Link>
        </div>
      </div>
    );
  }

  if (fetchingJob) {
    return (
      <div className="apply-container" style={{ textAlign: "center", padding: "3rem 1rem" }}>
        <p style={{ color: "#94a3b8" }}>Loading job details...</p>
      </div>
    );
  }

  if (!selectedJob) {
    return (
      <div className="apply-container" style={{ textAlign: "center", padding: "3rem 1rem" }}>
        <div className="apply-form-card" style={{ maxWidth: "500px", margin: "2rem auto", padding: "2rem" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📋</div>
          <h2 style={{ fontSize: "1.5rem", color: "#1e293b", marginBottom: "0.5rem" }}>No Job Selected</h2>
          <p style={{ fontSize: "1rem", color: "#64748b", marginBottom: "1.5rem" }}>
            Please select a job listing to submit your application.
          </p>
          <Link to="/jobs">
            <button className="common-button" style={{ padding: "0.75rem 2rem", fontSize: "1rem" }}>
              Browse Job Listings
            </button>
          </Link>
        </div>
      </div>
    );
  }

  if (user?.role === 'employer') {
    return (
      <div className="apply-container" style={{ textAlign: "center", padding: "3rem 1rem" }}>
        <div className="apply-form-card" style={{ maxWidth: "500px", margin: "2rem auto", padding: "2rem" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🚫</div>
          <h2 style={{ fontSize: "1.5rem", color: "#1e293b", marginBottom: "0.5rem" }}>Employer Account</h2>
          <p style={{ fontSize: "1rem", color: "#64748b", marginBottom: "1.5rem" }}>
            Employers cannot apply to job postings or save listings. Switch to a candidate account to submit applications.
          </p>
          <button 
            className="common-button" 
            onClick={() => navigate('/dashboard')}
            style={{ padding: "0.75rem 2rem", fontSize: "1rem" }}
          >
            Go to Employer Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (alreadyApplied) {
    return (
      <div className="apply-container" style={{ textAlign: "center", padding: "3rem 1rem" }}>
        <div className="apply-form-card" style={{ maxWidth: "500px", margin: "2rem auto", padding: "2rem" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📋</div>
          <h2 style={{ fontSize: "1.5rem", color: "#1e293b", marginBottom: "0.5rem" }}>Already Applied</h2>
          <p style={{ fontSize: "1rem", color: "#64748b", marginBottom: "1.5rem" }}>
            You have already submitted an application for <strong>{selectedJob.job_title || selectedJob.title}</strong>. Track status from your dashboard.
          </p>
          <button 
            className="common-button" 
            onClick={() => navigate('/dashboard')}
            style={{ padding: "0.75rem 2rem", fontSize: "1rem" }}
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="apply-container">
        <div className="apply-success-card">
          <h2>Application Submitted!</h2>
          <p>
            Thank you for applying to <strong>{selectedJob.job_title || selectedJob.title}</strong> at{" "}
            <strong>{selectedJob.company_name || selectedJob.company}</strong>.
          </p>
          <p>We will review your application and be in touch shortly.</p>
          <button 
            className="common-button" 
            onClick={() => navigate('/dashboard')}
            style={{ marginTop: '1.5rem' }}
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="apply-container">

      <div className="apply-job-card">
        <h1>{selectedJob.job_title || selectedJob.title}</h1>
        <div className="apply-job-meta">
          <span>{selectedJob.company_name || selectedJob.company}</span>
          <span>{selectedJob.job_location || selectedJob.location}</span>
          <span>{selectedJob.role_type || selectedJob.type}</span>
          <span>{selectedJob.pay_grade || selectedJob.salary}</span>
        </div>
        <p className="apply-job-description">{selectedJob.job_description || selectedJob.description}</p>
      </div>

      <div className="apply-form-card">
        <h2>Your Application</h2>

        {error && (
          <div style={{ padding: "0.75rem 1rem", marginBottom: "1rem", backgroundColor: "#fee2e2", color: "#991b1b", borderRadius: "0.375rem" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">First Name</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="lastName">Last Name</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="resumeText">Resume</label>
            <textarea
              id="resumeText"
              name="resumeText"
              value={formData.resumeText}
              onChange={handleChange}
              rows="8"
              placeholder="Paste your resume content here..."
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="coverLetter">Cover Letter (optional)</label>
            <textarea
              id="coverLetter"
              name="coverLetter"
              value={formData.coverLetter}
              onChange={handleChange}
              rows="5"
              placeholder="Tell us why you are a great fit for this role..."
            />
          </div>

          <button type="submit" className="common-button apply-submit-btn" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Application"}
          </button>

        </form>
      </div>
    </div>
  );
}

export default ApplyJob;