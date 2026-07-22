import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../api/apiClient.js";
import "../styles/manageAccount.css";

function ManageAccount() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    location: "",
    companyName: "",
    companySize: "11-50 Employees",
    companyWebsite: "",
    industry: "",
    companyDescription: "",
    headquartersLocation: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const isEmployer = user?.role === 'employer';

  useEffect(() => {
    if (user) {
      const nameParts = (user.name || "").trim().split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";
      setFormData(prev => ({
        ...prev,
        firstName,
        lastName,
        email: user.email || ""
      }));

      if (user.role === 'employer' && user.id) {
        api.get(`/api/employers/user/${user.id}`)
          .then(emp => {
            if (emp) {
              setFormData(prev => ({
                ...prev,
                companyName: emp.company_name || "",
                companySize: emp.company_size || "11-50 Employees",
                companyWebsite: emp.company_website || "",
                industry: emp.industry || "",
                companyDescription: emp.company_description || "",
                headquartersLocation: emp.headquarters_location || ""
              }));
            }
          })
          .catch(() => {});
      }
    }
  }, [user]);

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");

    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      setMessage("New passwords do not match.");
      setMessageType("error");
      return;
    }

    setSaving(true);

    try {
      if (isEmployer && user?.id) {
        await api.patch(`/api/employers/user/${user.id}`, {
          company_name: formData.companyName,
          company_size: formData.companySize,
          company_website: formData.companyWebsite,
          industry: formData.industry,
          company_description: formData.companyDescription,
          headquarters_location: formData.headquartersLocation,
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          email: formData.email
        });
      }

      setMessage("Account and company details saved successfully.");
      setMessageType("success");
    } catch (err) {
      setMessage(err.message || "Failed to update account details.");
      setMessageType("error");
    } finally {
      setSaving(false);
    }
  }

  if (!user) {
    return (
      <div className="manage-account-container" style={{ textAlign: "center", padding: "3rem 1rem" }}>
        <h1 className="manage-account-title">Manage Account</h1>
        <div className="form-card" style={{ maxWidth: "500px", margin: "2rem auto", padding: "2rem" }}>
          <p style={{ fontSize: "1.1rem", color: "#475569", marginBottom: "1.5rem" }}>
            You must be signed in to manage your account details.
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

  return (
    <div className="manage-account-container">
      <h1 className="manage-account-title">Manage Account</h1>

      <form onSubmit={handleSubmit} className="manage-account-form">

        {/* Personal Information */}
        <div className="form-card">
          <h2>Personal Information ({user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "User"})</h2>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">First Name</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
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
            <label htmlFor="location">Location</label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Employer / Company Profile Card */}
        {isEmployer && (
          <div className="form-card">
            <h2>Company Profile & Details</h2>

            <div className="form-group">
              <label htmlFor="companyName">Company Name</label>
              <input
                type="text"
                id="companyName"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                placeholder="e.g. Tech Solutions Inc."
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="companySize">Company Size</label>
                <select
                  id="companySize"
                  name="companySize"
                  value={formData.companySize}
                  onChange={handleChange}
                  style={{ width: "100%", padding: "0.75rem", borderRadius: "0.375rem", border: "1px solid #cbd5e1" }}
                >
                  <option value="1-10 Employees">1-10 Employees</option>
                  <option value="11-50 Employees">11-50 Employees</option>
                  <option value="51-200 Employees">51-200 Employees</option>
                  <option value="201-500 Employees">201-500 Employees</option>
                  <option value="500+ Employees">500+ Employees</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="companyWebsite">Company Website</label>
                <input
                  type="text"
                  id="companyWebsite"
                  name="companyWebsite"
                  value={formData.companyWebsite}
                  onChange={handleChange}
                  placeholder="e.g. https://techsolutions.com"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="industry">Industry</label>
                <input
                  type="text"
                  id="industry"
                  name="industry"
                  value={formData.industry}
                  onChange={handleChange}
                  placeholder="e.g. Software & Technology"
                />
              </div>

              <div className="form-group">
                <label htmlFor="headquartersLocation">Headquarters Location</label>
                <input
                  type="text"
                  id="headquartersLocation"
                  name="headquartersLocation"
                  value={formData.headquartersLocation}
                  onChange={handleChange}
                  placeholder="e.g. Toronto, ON"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="companyDescription">Company Description</label>
              <textarea
                id="companyDescription"
                name="companyDescription"
                value={formData.companyDescription}
                onChange={handleChange}
                rows="4"
                placeholder="Brief summary of your company culture and mission..."
                style={{ width: "100%", padding: "0.75rem", borderRadius: "0.375rem", border: "1px solid #cbd5e1" }}
              />
            </div>
          </div>
        )}

        {/* Password Card */}
        <div className="form-card">
          <h2>Change Password</h2>

          <div className="form-group">
            <label htmlFor="currentPassword">Current Password</label>
            <input
              type="password"
              id="currentPassword"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              placeholder="Enter current password"
            />
          </div>

          <div className="form-group">
            <label htmlFor="newPassword">New Password</label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              placeholder="Enter new password"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm new password"
            />
          </div>
        </div>

        {message && (
          <p className={`form-message ${messageType}`}>{message}</p>
        )}

        <button type="submit" className="common-button manage-save-btn" disabled={saving}>
          {saving ? "Saving Changes..." : "Save Changes"}
        </button>

      </form>
    </div>
  );
}

export default ManageAccount;