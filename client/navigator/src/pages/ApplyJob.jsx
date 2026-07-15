import { useState } from "react";
import "../styles/applyJob.css";

const dummyJob = {
  id: 1,
  title: "Frontend Developer",
  company: "Google",
  location: "Toronto, ON",
  type: "FullTime",
  salary: "$60,000",
  description:
    "We are looking for a skilled Frontend Developer to help build and maintain modern web applications. You will work closely with our design and backend teams to deliver great user experiences.",
};

function ApplyJob() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    resumeText: "",
    coverLetter: "",
  });

  const [submitted, setSubmitted] = useState(false);

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="apply-container">
        <div className="apply-success-card">
          <h2>Application Submitted!</h2>
          <p>
            Thank you for applying to <strong>{dummyJob.title}</strong> at{" "}
            <strong>{dummyJob.company}</strong>.
          </p>
          <p>We will review your application and be in touch shortly.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="apply-container">

      <div className="apply-job-card">
        <h1>{dummyJob.title}</h1>
        <div className="apply-job-meta">
          <span>{dummyJob.company}</span>
          <span>{dummyJob.location}</span>
          <span>{dummyJob.type}</span>
          <span>{dummyJob.salary}</span>
        </div>
        <p className="apply-job-description">{dummyJob.description}</p>
      </div>

      <div className="apply-form-card">
        <h2>Your Application</h2>

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

          <button type="submit" className="common-button apply-submit-btn">
            Submit Application
          </button>

        </form>
      </div>
    </div>
  );
}

export default ApplyJob;