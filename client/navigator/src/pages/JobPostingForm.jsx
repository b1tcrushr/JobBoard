import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../api/apiClient.js';
import "../styles/job.css";

const JobPostingForm = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [employer, setEmployer] = useState(null);
  const [loadingEmployer, setLoadingEmployer] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    location: '',
    workType: 'Remote',
    jobType: 'Full-Time',
    roleType: 'Full-Time',
    payGrade: 'Grade 1',
    experienceLevel: 'Entry Level',
    description: '',
    requirements: '',
    responsibilities: '',
    benefits: ''
  });

  useEffect(() => {
    if (!user || !user.id) {
      setLoadingEmployer(false);
      return;
    }

    api.get(`/api/employers/user/${user.id}`)
      .then(data => {
        setEmployer(data);
      })
      .catch(err => {
        setError(err.message || 'Could not load employer profile. Please ensure you are logged in as an employer.');
      })
      .finally(() => {
        setLoadingEmployer(false);
      });
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!employer || !employer.employer_id) {
      setError("Only verified employer accounts can create job postings.");
      return;
    }

    setIsSubmitting(true);
    setError('');

    const payload = {
      employer_id: employer.employer_id,
      company_id: employer.company_id,
      job_title: formData.title,
      job_location: formData.location,
      work_type: formData.workType,
      job_type: formData.jobType,
      job_description: formData.description,
      job_status: 'open',
      experience_level: formData.experienceLevel || null,
      role_type: formData.roleType,
      pay_grade: formData.payGrade,
      requirements: formData.requirements || null,
      responsibilities: formData.responsibilities || null,
      benefits: formData.benefits || null
    };

    try {
      await api.post('/api/jobs/create', payload);
      setIsSubmitted(true);
    } catch (err) {
      setError(err.message || 'Failed to publish job posting');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingEmployer) {
    return (
      <div className="page-container loading-container">
        <h2 style={{ color: '#a3a3a3' }}>Loading job creator...</h2>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ display: 'flex', justifyContent: 'center' }}>
      
      {isSubmitted ? (

        <div className="empty-state" style={{ maxWidth: '600px', width: '100%', borderColor: '#bbf7d0' }}>
          <div className="empty-state-icon" style={{ fontSize: '4rem' }}>✅</div>
          <h2 className="empty-state-title" style={{ color: '#16a34a' }}>Job Posted Successfully!</h2>
          <p className="empty-state-text">
            "{formData.title || 'Your new job'}" is now live and accepting applications.
          </p>
          <button 
            className="primary-btn" 
            onClick={() => navigate('/dashboard')}
            style={{ marginTop: '1rem' }}
          >
            Return to Dashboard
          </button>
        </div>

      ) : (
        /* JOB POSTING FORM */
        <div className="base-card" style={{ maxWidth: '800px', width: '100%' }}>
          <h1 className="section-title" style={{ fontSize: '1.8rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '2rem' }}>
            Post a New Job
          </h1>

          {error && (
            <div style={{ padding: '1rem', marginBottom: '1.5rem', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '0.375rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Job Title */}
            <div>
              <label style={styles.label}>Job Title</label>
              <input 
                type="text" 
                name="title"
                required
                className="form-input" 
                placeholder="E.g. Full Stack Engineer" 
                style={styles.fullWidthInput}
                value={formData.title}
                onChange={handleChange}
              />
            </div>

            {/* Location */}
            <div>
              <label style={styles.label}>Location</label>
              <input 
                type="text" 
                name="location"
                required
                className="form-input" 
                placeholder="E.g. Remote or Toronto, ON" 
                style={styles.fullWidthInput}
                value={formData.location}
                onChange={handleChange}
              />
            </div>

            {/* Experience Level, Work Type, Role Type, Pay Grade */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={styles.label}>Experience Level</label>
                <select name="experienceLevel" value={formData.experienceLevel} onChange={handleChange} className="form-select" style={styles.fullWidthInput}>
                  <option value="Entry Level">Entry Level</option>
                  <option value="3+ Years">3+ Years</option>
                  <option value="5+ Years">5+ Years</option>
                </select>
              </div>

              <div>
                <label style={styles.label}>Work Type</label>
                <select name="workType" value={formData.workType} onChange={handleChange} className="form-select" style={styles.fullWidthInput}>
                  <option value="Remote">Remote</option>
                  <option value="On-site">On-site</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>

              <div>
                <label style={styles.label}>Role Type</label>
                <select name="roleType" value={formData.roleType} onChange={handleChange} className="form-select" style={styles.fullWidthInput}>
                  <option value="Full-Time">Full-Time</option>
                  <option value="Part-Time">Part-Time</option>
                  <option value="Co-op">Co-op</option>
                </select>
              </div>

              <div>
                <label style={styles.label}>Pay Grade</label>
                <select name="payGrade" value={formData.payGrade} onChange={handleChange} className="form-select" style={styles.fullWidthInput}>
                  <option value="Grade 1">Grade 1</option>
                  <option value="Grade 2">Grade 2</option>
                  <option value="Grade 3">Grade 3</option>
                  <option value="Grade 4">Grade 4</option>
                </select>
              </div>
            </div>

            {/* Job Description */}
            <div>
              <label style={styles.label}>Job Description</label>
              <textarea 
                name="description"
                required
                className="form-input" 
                placeholder="Describe the role and responsibilities..." 
                style={styles.textarea}
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            {/* Requirements */}
            <div>
              <label style={styles.label}>Requirements</label>
              <textarea 
                name="requirements"
                required
                className="form-input" 
                placeholder="E.g.&#10;- Speaks English&#10;- Knows Python&#10;- Master's Degree" 
                style={styles.textarea}
                value={formData.requirements}
                onChange={handleChange}
              />
            </div>

            {/* Responsibilities */}
            <div>
              <label style={styles.label}>Responsibilities</label>
              <textarea 
                name="responsibilities"
                className="form-input" 
                placeholder="Key day-to-day duties and responsibilities..." 
                style={styles.textarea}
                value={formData.responsibilities}
                onChange={handleChange}
              />
            </div>

            {/* Benefits */}
            <div>
              <label style={styles.label}>Benefits</label>
              <textarea 
                name="benefits"
                className="form-input" 
                placeholder="Health insurance, 401(k), paid time off..." 
                style={styles.textarea}
                value={formData.benefits}
                onChange={handleChange}
              />
            </div>

            {/* Submit Button */}
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
              <button 
                type="submit" 
                className="primary-btn" 
                disabled={isSubmitting}
                style={{ fontSize: '1.1rem', padding: '0.75rem 3rem' }}
              >
                {isSubmitting ? 'Publishing...' : 'Publish Job Listing'}
              </button>
            </div>

          </form>
        </div>
      )}
    </div>
  );
};

const styles = {
  label: {
    display: 'block',
    marginBottom: '0.5rem',
    fontWeight: '600',
    color: '#1a202c'
  },
  fullWidthInput: {
    width: '100%',
    boxSizing: 'border-box'
  },
  textarea: {
    width: '100%',
    minHeight: '100px',
    boxSizing: 'border-box',
    resize: 'vertical',
    fontFamily: 'inherit'
  }
};

export default JobPostingForm;