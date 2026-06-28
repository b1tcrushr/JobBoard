import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import "../styles/job.css"

const mockDatabase = [
  {
    id: 1,
    title: "Data Governance Analyst (Fall Co-op)",
    company: "Laurier Analytics Group",
    location: "Waterloo, ON (Hybrid)",
    salary: "Grade 4 ($25/hr)",
    benefits: [
      "Flexible working hours",
      "Direct mentorship from senior analysts",
      "Networking events"
    ],
    description: "Looking for an analytical student to assist with data governance initiatives. You will be responsible for ensuring data integrity across our platforms and helping to build out our internal reporting dashboards.",
    requirements: [
      "Currently enrolled in Business, Economics, or Computer Science",
      "Strong proficiency in Excel and data visualization tools",
      "Excellent communication skills"
    ],
    responsibilities: [
      "Clean and organize large datasets",
      "Assist in the development of data governance policies",
      "Build and maintain reporting dashboards"
    ],
    aboutCompany: {
      description: "Laurier Analytics Group is a premier internal team dedicated to optimizing data strategies and operational efficiency.",
      size: "10 - 50 employees",
      industry: "Education / Analytics",
      website: "wlu.ca"
    }
  },
  {
    id: 2,
    title: "Senior Full Stack Engineer",
    company: "TechCorp Solutions",
    location: "New York, NY (Hybrid)",
    salary: "$120,000 - $140,000",
    benefits: [
      "Health, Dental, & Vision",
      "401k with 4% matching",
      "Unlimited PTO"
    ],
    description: "We are looking for a Senior Full Stack Engineer to join our core product team. You will help scale our distributed systems and collaborate across functional teams to deliver high-quality software.",
    requirements: [
      "5+ years of professional software engineering experience",
      "Proficiency in React, Node.js, and TypeScript",
      "Experience with AWS cloud infrastructure",
      "Strong understanding of system design and architecture"
    ],
    responsibilities: [
      "Design, develop, and maintain robust, scalable APIs",
      "Collaborate with product managers and designers",
      "Mentor junior engineers and conduct thorough code reviews",
      "Optimize application performance and scalability"
    ],
    aboutCompany: {
      description: "TechCorp Solutions is a leading innovator in cloud solutions, serving over 10 million users worldwide.",
      size: "500 - 1,000 employees",
      industry: "Software / Tech",
      website: "techcorp.com"
    }
  },
  {
    id: 3,
    title: "UI/UX Product Designer",
    company: "Creative Studio",
    location: "Remote (US)",
    salary: "$95,000 - $110,000",
    benefits: [
      "Comprehensive Health Plan",
      "Remote Work Stipend",
      "Generous PTO"
    ],
    description: "Seeking a talented Product Designer to lead the design of our next-generation web applications. You will be responsible for end-to-end design, from user research to high-fidelity prototyping.",
    requirements: [
      "3+ years of product design experience",
      "Expertise in Figma and Adobe Creative Suite",
      "A strong portfolio demonstrating complex problem solving"
    ],
    responsibilities: [
      "Conduct user research and usability testing",
      "Create wireframes, prototypes, and detailed UI designs",
      "Maintain and evolve our design system"
    ],
    aboutCompany: {
      description: "Creative Studio is an award-winning design agency specializing in digital product creation.",
      size: "50 - 100 employees",
      industry: "Design / Creative",
      website: "creativestudio.design"
    }
  },
  {
    id: 4,
    title: "Junior Data Analyst",
    company: "Finance Group Inc.",
    location: "Toronto, ON (On-site)",
    salary: "Grade 5 ($35/hr)",
    benefits: [
      "Transit Pass Subsidy",
      "Professional Development Budget",
      "Catered Lunches"
    ],
    description: "Join our fast-paced analytics team to help drive financial insights. This is a great entry-level opportunity for a detail-oriented individual looking to grow their career in data analytics.",
    requirements: [
      "Degree in Finance, Statistics, or related field",
      "Proficiency with SQL and Python",
      "Strong analytical mindset"
    ],
    responsibilities: [
      "Generate daily and weekly financial reports",
      "Analyze market trends and provide actionable insights",
      "Support senior analysts with ad-hoc requests"
    ],
    aboutCompany: {
      description: "Finance Group Inc. manages a diverse portfolio of investments and provides strategic financial advisory services.",
      size: "1,000 - 5,000 employees",
      industry: "Finance",
      website: "financegroup.com"
    }
  }
];

const JobDetails = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [jobData, setJobData] = useState(null);
  
  const navigate = useNavigate();
  const { id } = useParams(); 

  useEffect(() => {
    const foundJob = mockDatabase.find(job => job.id === parseInt(id));
    setJobData(foundJob);
  }, [id]);

  const handleApplyClick = () => {
    const isGuest = false; 
    
    if (isGuest) {
      setShowAuthModal(true);
    } else {
      navigate(`/apply`);
    }
  };

  if (!jobData) {
    return (
      <div className="page-container loading-container">
        <h2 style={{ color: '#a3a3a3' }}>Loading job details...</h2>
      </div>
    );
  }

  return (
    <div className="page-container">
      
      {/* Top Header Card */}
      <div className="header-card">
        <div>
          <h1 className="job-title-main">{jobData.title}</h1>
          <p className="job-subtitle">{jobData.company} • {jobData.location}</p>
        </div>
        <div className="header-actions">
          <button className="primary-btn" onClick={handleApplyClick}>Apply Now</button>
          <button className="secondary-btn">★ Save Job</button>
        </div>
      </div>

      {/* Main Two-Column Grid */}
      <div className="content-grid">
        
        {/* Left Column: Job Details */}
        <div className="main-column">
          <section>
            <h2 className="section-heading">Job Description</h2>
            <p className="paragraph">{jobData.description}</p>
          </section>

          <section>
            <h2 className="section-heading">Requirements</h2>
            <ul className="text-list">
              {jobData.requirements.map((req, index) => (
                <li key={index} className="list-item">{req}</li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="section-heading">Roles & Responsibilities</h2>
            <ul className="text-list">
              {jobData.responsibilities.map((task, index) => (
                <li key={index} className="list-item">{task}</li>
              ))}
            </ul>
          </section>
        </div>

        {/* Right Column: Sidebar */}
        <div className="sidebar-column">
          
          <div className="sidebar-card-green">
            <h3 className="sidebar-heading">Salary & Benefits</h3>
            <p className="salary-text">{jobData.salary}</p>
            <ul className="text-list">
              {jobData.benefits.map((benefit, index) => (
                <li key={index} className="list-item">{benefit}</li>
              ))}
            </ul>
          </div>

          <div className="sidebar-card">
            <h3 className="sidebar-heading">About {jobData.company}</h3>
            <p className="paragraph">{jobData.aboutCompany.description}</p>
            <div className="company-meta">
              <p><strong>Size:</strong> {jobData.aboutCompany.size}</p>
              <p><strong>Industry:</strong> {jobData.aboutCompany.industry}</p>
              <p><strong>Website:</strong> {jobData.aboutCompany.website}</p>
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