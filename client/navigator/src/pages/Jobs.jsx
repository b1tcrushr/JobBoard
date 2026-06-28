import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import "../styles/job.css"

const initialJobs = [
  {
    id: 1,
    title: 'Data Governance Analyst (Fall Co-op)',
    company: 'Laurier Analytics Group',
    location: 'Waterloo, ON (Hybrid)',
    experience: 'Entry Level',
    roleType: 'Co-op',
    payGrade: 'Grade 4 ($25/hr)',
    posted: '2 hours ago'
  },
  {
    id: 2,
    title: 'Senior Full Stack Engineer',
    company: 'TechCorp Solutions',
    location: 'New York, NY (Hybrid)',
    experience: '5+ Years',
    roleType: 'Full-Time',
    payGrade: 'Grade 8 ($120k - $140k)',
    posted: '2 hours ago'
  },
  {
    id: 3,
    title: 'UI/UX Product Designer',
    company: 'Creative Studio',
    location: 'Remote (US)',
    experience: '3+ Years',
    roleType: 'Full-Time',
    payGrade: 'Grade 7 ($95k - $110k)',
    posted: '1 day ago'
  },
  {
    id: 4,
    title: 'Junior Data Analyst',
    company: 'Finance Group Inc.',
    location: 'Toronto, ON (On-site)',
    experience: 'Entry Level',
    roleType: 'Part-Time',
    payGrade: 'Grade 5 ($35/hr)',
    posted: '3 days ago'
  }
];

const Jobs = () => {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [experience, setExperience] = useState('');
  const [roleType, setRoleType] = useState('');
  const [payGrade, setPayGrade] = useState('');
  
  const [filteredJobs, setFilteredJobs] = useState(initialJobs);
  
  const handleSearch = (e) => {
    e.preventDefault();
    
    const results = initialJobs.filter(job => {
      const matchKeyword = job.title.toLowerCase().includes(keyword.toLowerCase()) || 
                           job.company.toLowerCase().includes(keyword.toLowerCase());
      const matchLocation = job.location.toLowerCase().includes(location.toLowerCase());
      const matchExperience = experience === '' || job.experience === experience;
      const matchRoleType = roleType === '' || job.roleType === roleType;
      const matchPayGrade = payGrade === '' || job.payGrade === payGrade;

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
    setFilteredJobs(initialJobs);
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
            <option value="Grade 4 ($25/hr)">Grade 4</option>
            <option value="Grade 5 ($35/hr)">Grade 5</option>
            <option value="Grade 7 ($95k - $110k)">Grade 7</option>
            <option value="Grade 8 ($120k - $140k)">Grade 8</option>
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
                <div key={job.id} className="job-card">
                  <div className="job-info">
                    <h4 className="job-title">{job.title}</h4>
                    <p className="company-location-text">
                      <span className="highlight-blue">{job.company}</span> • {job.location}
                    </p>
                    <p className="job-details-text">
                      Experience: {job.experience} • {job.roleType} • {job.payGrade}
                    </p>
                    <p className="posted-date">Posted: {job.posted}</p>
                  </div>
                  
                  <button 
                    className="primary-btn"
                    onClick={() => navigate(`/jobs/${job.id}`)}
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