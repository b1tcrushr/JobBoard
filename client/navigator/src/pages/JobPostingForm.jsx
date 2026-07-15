import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "../styles/job.css";

const JobPostingForm = () => {
  const navigate = useNavigate();
  
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    location: '',
    minPay: '',
    maxPay: '',
    description: '',
    requirements: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("Publishing Job:", formData);
    
    setIsSubmitted(true);
  };

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
            onClick={() => navigate('/edashboard')}
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

            {/* Pay Range */}
            <div>
              <label style={styles.label}>Pay Range</label>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <input 
                  type="text" 
                  name="minPay"
                  className="form-input" 
                  placeholder="Min (e.g. $120k)" 
                  style={{ flex: 1 }}
                  value={formData.minPay}
                  onChange={handleChange}
                />
                <input 
                  type="text" 
                  name="maxPay"
                  className="form-input" 
                  placeholder="Max (e.g. $150k)" 
                  style={{ flex: 1 }}
                  value={formData.maxPay}
                  onChange={handleChange}
                />
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

            {/* Submit Button */}
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
              <button type="submit" className="primary-btn" style={{ fontSize: '1.1rem', padding: '0.75rem 3rem' }}>
                Publish Job Listing
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
    minHeight: '120px',
    boxSizing: 'border-box',
    resize: 'vertical',
    fontFamily: 'inherit'
  }
};

export default JobPostingForm;
