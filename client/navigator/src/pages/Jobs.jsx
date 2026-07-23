import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "../styles/job.css"
import { useEffect } from 'react';
import { api } from '../api/apiClient';


const Jobs = () => {
 
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const JOBS_PER_PAGE = 20;

  // Filters
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [experience, setExperience] = useState('');
  const [jobType, setJobType] = useState('');
  const [payGrade, setPayGrade] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest', 'title'

  const [filteredJobs, setFilteredJobs] = useState([]);

  useEffect(() => {
    api.get("/api/jobs")
      .then(data => {
        const jobList = Array.isArray(data) ? data : [];
        setJobs(jobList);
        applyFiltersAndSort(jobList, keyword, location, experience, jobType, payGrade, sortBy);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  function applyFiltersAndSort(list, kw, loc, exp, jt, pg, sort) {
    let results = list.filter(job => {
      const matchKeyword = (job.job_title || '').toLowerCase().includes(kw.toLowerCase()) ||
                           (job.company_name || '').toLowerCase().includes(kw.toLowerCase());
      const matchLocation = (job.job_location || '').toLowerCase().includes(loc.toLowerCase());
      const matchExperience = exp === '' || job.experience_level === exp;
      const matchJobType = jt === '' || job.job_type === jt || job.role_type === jt;
      const matchPayGrade = pg === '' || job.pay_grade === pg;

      return matchKeyword && matchLocation && matchExperience && matchJobType && matchPayGrade;
    });

    results.sort((a, b) => {
      if (sort === 'oldest') {
        return (a.job_id || 0) - (b.job_id || 0);
      } else if (sort === 'title') {
        return (a.job_title || '').localeCompare(b.job_title || '');
      } else {
        // Default 'newest'
        return (b.job_id || 0) - (a.job_id || 0);
      }
    });

    setFilteredJobs(results);
    setCurrentPage(1);
  }

  const handleSearch = (e) => {
    e.preventDefault();
    applyFiltersAndSort(jobs, keyword, location, experience, jobType, payGrade, sortBy);
  };

  const handleSortChange = (e) => {
    const newSort = e.target.value;
    setSortBy(newSort);
    applyFiltersAndSort(jobs, keyword, location, experience, jobType, payGrade, newSort);
  };

  const clearFilters = () => {
    setKeyword('');
    setLocation('');
    setExperience('');
    setJobType('');
    setPayGrade('');
    setSortBy('newest');
    applyFiltersAndSort(jobs, '', '', '', '', '', 'newest');
  };

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(filteredJobs.length / JOBS_PER_PAGE));
  const indexOfLastJob = currentPage * JOBS_PER_PAGE;
  const indexOfFirstJob = indexOfLastJob - JOBS_PER_PAGE;
  const currentJobs = filteredJobs.slice(indexOfFirstJob, indexOfLastJob);

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
          
          <select value={jobType} onChange={(e) => setJobType(e.target.value)} className="form-select">
            <option value="">Job Type ▾</option>
            <option value="Full-Time">Full-Time</option>
            <option value="Part-Time">Part-Time</option>
            <option value="Co-op">Co-op</option>
            <option value="Contract">Contract</option>
          </select>
          
          <select value={payGrade} onChange={(e) => setPayGrade(e.target.value)} className="form-select">
            <option value="">Pay Grade ▾</option>
            <option value="Grade 1">Grade 1</option>
            <option value="Grade 2">Grade 2</option>
            <option value="Grade 3">Grade 3</option>
            <option value="Grade 4">Grade 4</option>
          </select>

          <select value={sortBy} onChange={handleSortChange} className="form-select">
            <option value="newest">Sort: Newest First ▾</option>
            <option value="oldest">Sort: Oldest First ▾</option>
            <option value="title">Sort: Title (A-Z) ▾</option>
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
              {currentJobs.map(job => (
                <div key={job.job_id} className="job-card">
                  <div className="job-info">
                    <h4 className="job-title">{job.job_title}</h4>
                    <p className="company-location-text">
                      <span className="highlight-blue">{job.company_name}</span> • {job.job_location}
                    </p>
                    <p className="job-details-text">
                      Experience: {job.experience_level || 'Entry Level'} • {job.role_type || job.job_type} • {job.pay_grade || 'Grade 1'}
                    </p>
                  </div>
                  
                  <button 
                    className="primary-btn"
                    onClick={() => navigate(`/jobs/${job.job_id}`)}
                  >
                    View Details
                  </button>
                  
                </div>
              ))}
              
              {/* Dynamic Pagination Bar */}
              <div className="pagination" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '2rem' }}>
                <button 
                  className="secondary-btn"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  style={{ padding: '0.4rem 1rem', opacity: currentPage === 1 ? 0.5 : 1, cursor: currentPage === 1 ? 'default' : 'pointer' }}
                >
                  ◀ Previous
                </button>

                <span style={{ fontSize: '0.95rem', fontWeight: '600', color: '#475569' }}>
                  Page {currentPage} of {totalPages} ({filteredJobs.length} Job{filteredJobs.length === 1 ? '' : 's'})
                </span>

                <button 
                  className="secondary-btn"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  style={{ padding: '0.4rem 1rem', opacity: currentPage === totalPages ? 0.5 : 1, cursor: currentPage === totalPages ? 'default' : 'pointer' }}
                >
                  Next ▶
                </button>
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