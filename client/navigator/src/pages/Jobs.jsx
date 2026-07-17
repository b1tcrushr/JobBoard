import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "../styles/job.css"
import { useEffect } from 'react';
import { api } from '../api/apiClient';


const Jobs = () => {
 
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  //Filters
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [experience, setExperience] = useState('');
  const [roleType, setRoleType] = useState('');
  const [payGrade, setPayGrade] = useState('');

  const [filteredJobs, setFilteredJobs] = useState([]);

  useEffect(() => {
    api.get("/api/jobs")
      .then(data => {
        setJobs(data);
        setFilteredJobs(data);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  },[]);

  const handleSearch = (e) => {
    e.preventDefault();
    
    const results = jobs.filter(job => {
      const matchKeyword = job.job_title.toLowerCase().includes(keyword.toLowerCase()) ||
                           job.company_name.toLowerCase().includes(keyword.toLowerCase());
      const matchLocation = (job.job_location || '').toLowerCase().includes(location.toLowerCase());
      const matchExperience = experience === '' || job.experience_level === experience;
      const matchRoleType = roleType === '' || job.role_type === roleType;
      const matchPayGrade = payGrade === '' || job.pay_grade === payGrade;

      return matchKeyword && matchLocation && matchExperience && matchRoleType && matchPayGrade;
    });

    setFilteredJobs(results);
  };

  const clearFilters = () => {
    setKeyword('');
    setLocation('');
    setExperience('');
    setRoleType('');
    setPayGrade('');
    setFilteredJobs(jobs);
  };

  return (
    <div className="page-container">
      
      {/* Search & Filter Bar */}
      <section className="search-section">
        <h2 className="section-title">Find Your Next Opportunity</h2>
        <form onSubmit={handleSearch} className="search-form">
          
          <input 
            type="text" 
            placeholder="🔍 Keyword (e.g. React)" 
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="form-input"
          />
          
          <input 
            type="text" 
            placeholder="📍 Location (e.g. Remote)" 
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="form-input"
          />
          
          <select value={experience} onChange={(e) => setExperience(e.target.value)} className="form-select">
            <option value="">Experience Level ▾</option>
            <option value="Entry Level">Entry Level</option>
            <option value="3+ Years">3+ Years</option>
            <option value="5+ Years">5+ Years</option>
          </select>
          
          <select value={roleType} onChange={(e) => setRoleType(e.target.value)} className="form-select">
            <option value="">Role Type (FT, PT) ▾</option>
            <option value="Full-Time">Full-Time</option>
            <option value="Part-Time">Part-Time</option>
            <option value="Co-op">Co-op</option>
          </select>
          
          <select value={payGrade} onChange={(e) => setPayGrade(e.target.value)} className="form-select">
            <option value="">Pay Grade ▾</option>
            <option value="Grade 1">Grade 1</option>
            <option value="Grade 2">Grade 2</option>
            <option value="Grade 3">Grade 3</option>
            <option value="Grade 4">Grade 4</option>
          </select>

          <button type="submit" className="primary-btn">Search Jobs</button>
        </form>
      </section>

      {/* Main Content Layout */}
      <div className="main-layout">
        
        {/* Active Job Listings */}
        <section className="job-listings-section">
          <h3 className="list-title-center">Active Job Listings</h3>
          
          {filteredJobs.length > 0 ? (
            <div className="job-list">
              {filteredJobs.map(job => (
                <div key={job.job_id} className="job-card">
                  <div className="job-info">
                    <h4 className="job-title">{job.job_title}</h4>
                    <p className="company-location-text">
                      <span className="highlight-blue">{job.company_name}</span> • {job.job_location}
                    </p>
                    <p className="job-details-text">
                      Experience: {job.experience_level} • {job.role_type} • {job.pay_grade}
                    </p>
                  </div>
                  
                  <button 
                    className="primary-btn"
                    onClick={() => navigate(`/jobs/${job.job_id}`)}
                  >
                    View & Apply
                  </button>
                  
                </div>
              ))}
              
              <div className="pagination">
                <span>◀ Page 1 of 12 ▶</span>
              </div>
            </div>
          ) : (
            
            <div className="empty-state">
              <div className="empty-state-icon">🔍</div>
              <h3 className="empty-state-title">No Results Found</h3>
              <p className="empty-state-text">
                We couldn't find any jobs matching your exact search criteria.
              </p>
              <div className="suggestions-box">
                <p>Suggestions:</p>
                <ul className="suggestions-list">
                  <li>Check spelling of keywords</li>
                  <li>Broaden your location settings</li>
                  <li>Remove some filter constraints</li>
                </ul>
              </div>
              <button onClick={clearFilters} className="clear-btn">Clear All Filters</button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Jobs;