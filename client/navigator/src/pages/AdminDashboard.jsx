import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../api/apiClient.js";
import "../styles/adminDashboard.css";

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("postings");

  // Data states
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [employers, setEmployers] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

  // Filter states
  const [userSearch, setUserSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const [jobSearch, setJobSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Applicants Modal State
  const [viewingApplicantsJob, setViewingApplicantsJob] = useState(null);
  const [jobApplications, setJobApplications] = useState([]);
  const [loadingApps, setLoadingApps] = useState(false);

  // Edit Modals State
  const [editingUser, setEditingUser] = useState(null);
  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    role: "candidate",
    phone: "",
    location: "",
    newPassword: "",
    company_name: "",
    industry: "",
    headquarters_location: "",
    company_size: "11-50 Employees",
    company_website: "",
    company_description: ""
  });

  const [editingJob, setEditingJob] = useState(null);
  const [jobForm, setJobForm] = useState({
    title: "",
    location: "Remote",
    workType: "Remote",
    jobType: "Full-Time",
    status: "open",
    roleType: "Full-Time",
    payGrade: "Grade 1",
    description: "",
    requirements: "",
    responsibilities: "",
    benefits: ""
  });

  // Create Modals State
  const [creatingUser, setCreatingUser] = useState(false);
  const [createUserForm, setCreateUserForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "candidate",
    company_name: "",
    industry: "",
    headquarters_location: "",
    phone: "",
    location: ""
  });

  const [creatingJob, setCreatingJob] = useState(false);
  const [createJobForm, setCreateJobForm] = useState({
    employer_id: "",
    company_id: "",
    job_title: "",
    job_location: "Remote",
    work_type: "Remote",
    job_type: "Full-Time",
    job_status: "open",
    role_type: "Full-Time",
    pay_grade: "Grade 1",
    job_description: "",
    requirements: "",
    responsibilities: "",
    benefits: ""
  });

  // Apply Candidate Modal State
  const [applyingCandidate, setApplyingCandidate] = useState(false);
  const [applyForm, setApplyForm] = useState({
    candidate_id: "",
    job_id: "",
    resume_text: "Experienced candidate resume details submitted via Admin Console.",
    cover_letter: "I am writing to express my interest in this position."
  });

  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  function loadDashboardData() {
    setLoading(true);
    setError("");
    Promise.all([
      api.get("/api/users").catch(err => { setError(err.message); return []; }),
      api.get("/api/jobs/admin/all").catch(err => { setError(err.message); return []; }),
      api.get("/api/employers").catch(() => []),
      api.get("/api/candidates").catch(() => [])
    ]).then(([userData, jobData, empData, candData]) => {
      setUsers(Array.isArray(userData) ? userData : []);
      setJobs(Array.isArray(jobData) ? jobData : []);
      setEmployers(Array.isArray(empData) ? empData : []);
      setCandidates(Array.isArray(candData) ? candData : []);
    }).finally(() => setLoading(false));
  }

  // --- View Applicants Handler ---
  function openApplicantsModal(job) {
    setViewingApplicantsJob(job);
    setLoadingApps(true);
    api.get(`/api/applications/job/${job.job_id}`)
      .then(data => setJobApplications(Array.isArray(data) ? data : []))
      .catch(err => setError(err.message || "Failed to load job applications."))
      .finally(() => setLoadingApps(false));
  }

  async function handleUpdateAppStatus(appId, newStatus) {
    try {
      await api.patch(`/api/applications/${appId}`, { status: newStatus });
      setJobApplications(prev => prev.map(a => a.app_id === appId ? { ...a, status: newStatus } : a));
      setActionSuccess(`Application status updated to "${newStatus}".`);
      setTimeout(() => setActionSuccess(""), 4000);
    } catch (err) {
      setError(err.message || "Failed to update application status.");
    }
  }

  // --- Apply Candidate Handler ---
  function openApplyCandidateModal(targetJob = null, targetCandidate = null) {
    setApplyForm({
      candidate_id: targetCandidate ? String(targetCandidate.candidate_id || targetCandidate.id) : (candidates[0]?.candidate_id ? String(candidates[0].candidate_id) : ""),
      job_id: targetJob ? String(targetJob.job_id || targetJob.id) : (jobs.find(j => j.job_status?.toLowerCase() === "open")?.job_id ? String(jobs.find(j => j.job_status?.toLowerCase() === "open").job_id) : ""),
      resume_text: "Experienced candidate resume details submitted via Admin Console.",
      cover_letter: "I am writing to express my interest in this position."
    });
    setApplyingCandidate(true);
  }

  async function handleApplyCandidateSubmit(e) {
    e.preventDefault();
    if (!applyForm.candidate_id || !applyForm.job_id) {
      setError("Please select both a candidate and a job posting.");
      return;
    }

    const selectedCand = candidates.find(c => String(c.candidate_id) === String(applyForm.candidate_id));
    const selectedJobObj = jobs.find(j => String(j.job_id) === String(applyForm.job_id));

    setSavingEdit(true);
    setError("");

    try {
      await api.post("/api/applications/create", {
        job_id: parseInt(applyForm.job_id),
        candidate_id: parseInt(applyForm.candidate_id),
        company_id: selectedJobObj ? selectedJobObj.company_id : undefined,
        resume_text: applyForm.resume_text,
        cover_letter: applyForm.cover_letter
      });

      setActionSuccess(`Application submitted successfully for candidate "${selectedCand?.name || "Candidate"}" to job "${selectedJobObj?.job_title || "Job"}".`);
      setApplyingCandidate(false);
      
      if (viewingApplicantsJob && String(viewingApplicantsJob.job_id) === String(applyForm.job_id)) {
        openApplicantsModal(viewingApplicantsJob);
      }
      setTimeout(() => setActionSuccess(""), 4000);
    } catch (err) {
      setError(err.message || "Failed to submit application.");
    } finally {
      setSavingEdit(false);
    }
  }

  // --- Create User Account Handler ---
  async function handleCreateUserSubmit(e) {
    e.preventDefault();
    setSavingEdit(true);
    setError("");

    try {
      const regRes = await api.post("/api/users/register", {
        name: createUserForm.name,
        email: createUserForm.email,
        password: createUserForm.password,
        role: createUserForm.role,
        company_name: createUserForm.role === "employer" ? createUserForm.company_name : undefined,
        industry: createUserForm.role === "employer" ? createUserForm.industry : undefined,
        headquarters_location: createUserForm.role === "employer" ? createUserForm.headquarters_location : undefined
      });

      const newUserId = regRes.id;
      if (newUserId && (createUserForm.phone || createUserForm.location)) {
        await api.patch(`/api/users/${newUserId}`, {
          phone: createUserForm.phone,
          location: createUserForm.location
        }).catch(() => {});
      }

      setActionSuccess(`New ${createUserForm.role} account for "${createUserForm.name}" created successfully.`);
      setCreatingUser(false);
      setCreateUserForm({
        name: "",
        email: "",
        password: "",
        role: "candidate",
        company_name: "",
        industry: "",
        headquarters_location: "",
        phone: "",
        location: ""
      });
      loadDashboardData();
      setTimeout(() => setActionSuccess(""), 4000);
    } catch (err) {
      setError(err.message || "Failed to create user account.");
    } finally {
      setSavingEdit(false);
    }
  }

  // --- Create Job Posting on Behalf of Employer Handler ---
  async function handleCreateJobSubmit(e) {
    e.preventDefault();
    if (!createJobForm.employer_id) {
      setError("Please select an employer for this job posting.");
      return;
    }

    const selectedEmployer = employers.find(emp => String(emp.employer_id) === String(createJobForm.employer_id));
    if (!selectedEmployer) {
      setError("Selected employer not found.");
      return;
    }

    setSavingEdit(true);
    setError("");

    try {
      await api.post("/api/jobs/create", {
        employer_id: parseInt(selectedEmployer.employer_id),
        company_id: parseInt(selectedEmployer.company_id),
        job_title: createJobForm.job_title,
        job_location: createJobForm.job_location,
        work_type: createJobForm.work_type,
        job_type: createJobForm.job_type,
        job_description: createJobForm.job_description,
        job_status: createJobForm.job_status,
        role_type: createJobForm.role_type,
        pay_grade: createJobForm.pay_grade,
        requirements: createJobForm.requirements,
        responsibilities: createJobForm.responsibilities,
        benefits: createJobForm.benefits
      });

      setActionSuccess(`Job posting "${createJobForm.job_title}" created on behalf of ${selectedEmployer.company_name || selectedEmployer.name}.`);
      setCreatingJob(false);
      setCreateJobForm({
        employer_id: "",
        company_id: "",
        job_title: "",
        job_location: "Remote",
        work_type: "Remote",
        job_type: "Full-Time",
        job_status: "open",
        role_type: "Full-Time",
        pay_grade: "Grade 1",
        job_description: "",
        requirements: "",
        responsibilities: "",
        benefits: ""
      });
      loadDashboardData();
      setTimeout(() => setActionSuccess(""), 4000);
    } catch (err) {
      setError(err.message || "Failed to create job posting.");
    } finally {
      setSavingEdit(false);
    }
  }

  // --- User Edit & Delete Handlers ---
  function openUserEdit(userToEdit) {
    setEditingUser(userToEdit);
    setUserForm({
      name: userToEdit.name || "",
      email: userToEdit.email || "",
      role: userToEdit.role || "candidate",
      phone: userToEdit.phone || "",
      location: userToEdit.location || "",
      newPassword: "",
      company_name: "",
      industry: "",
      headquarters_location: "",
      company_size: "11-50 Employees",
      company_website: "",
      company_description: ""
    });

    if (userToEdit.user_id) {
      api.get(`/api/employers/user/${userToEdit.user_id}`)
        .then(emp => {
          if (emp) {
            setUserForm(prev => ({
              ...prev,
              company_name: emp.company_name || "",
              industry: emp.industry || "",
              headquarters_location: emp.headquarters_location || "",
              company_size: emp.company_size || "11-50 Employees",
              company_website: emp.company_website || "",
              company_description: emp.company_description || ""
            }));
          }
        })
        .catch(() => {});
    }
  }

  async function handleSaveUser(e) {
    e.preventDefault();
    if (!editingUser) return;
    setSavingEdit(true);
    setError("");

    try {
      const res = await api.patch(`/api/users/${editingUser.user_id}`, {
        name: userForm.name,
        email: userForm.email,
        role: userForm.role,
        phone: userForm.phone,
        location: userForm.location,
        newPassword: userForm.newPassword || undefined,
        company_name: userForm.role === "employer" ? userForm.company_name : undefined,
        industry: userForm.role === "employer" ? userForm.industry : undefined,
        headquarters_location: userForm.role === "employer" ? userForm.headquarters_location : undefined,
        company_size: userForm.role === "employer" ? userForm.company_size : undefined,
        company_website: userForm.role === "employer" ? userForm.company_website : undefined,
        company_description: userForm.role === "employer" ? userForm.company_description : undefined
      });

      const updatedUser = res.user || { ...editingUser, ...userForm };
      
      setUsers(prev => prev.map(u => u.user_id === editingUser.user_id ? { ...u, ...updatedUser } : u));
      setActionSuccess(`User account "${updatedUser.name}" updated successfully.`);
      setEditingUser(null);
      setTimeout(() => setActionSuccess(""), 4000);
    } catch (err) {
      setError(err.message || "Failed to update user account.");
    } finally {
      setSavingEdit(false);
    }
  }

  async function handleDeleteUser(userId, userName) {
    if (!window.confirm(`Are you sure you want to delete user "${userName}" (ID: ${userId})? This will permanently remove their profile and data.`)) {
      return;
    }

    try {
      await api.delete(`/api/users/${userId}`);
      setUsers(prev => prev.filter(u => u.user_id !== userId));
      setActionSuccess(`User "${userName}" was successfully deleted.`);
      setTimeout(() => setActionSuccess(""), 4000);
    } catch (err) {
      setError(err.message || "Failed to delete user.");
    }
  }

  // --- Job Edit & Delete Handlers ---
  function openJobEdit(jobToEdit) {
    setEditingJob(jobToEdit);
    setJobForm({
      title: jobToEdit.job_title || "",
      location: jobToEdit.job_location || "Remote",
      workType: jobToEdit.work_type || "Remote",
      jobType: jobToEdit.job_type || "Full-Time",
      status: jobToEdit.job_status || "open",
      roleType: jobToEdit.role_type || "Full-Time",
      payGrade: jobToEdit.pay_grade || "Grade 1",
      description: jobToEdit.job_description || "",
      requirements: jobToEdit.requirements || "",
      responsibilities: jobToEdit.responsibilities || "",
      benefits: jobToEdit.benefits || ""
    });
  }

  async function handleSaveJob(e) {
    e.preventDefault();
    if (!editingJob) return;
    setSavingEdit(true);
    setError("");

    try {
      await api.patch(`/api/jobs/${editingJob.job_id}`, jobForm);
      
      setJobs(prev => prev.map(j => {
        if (j.job_id === editingJob.job_id) {
          return {
            ...j,
            job_title: jobForm.title,
            job_location: jobForm.location,
            work_type: jobForm.workType,
            job_type: jobForm.jobType,
            job_status: jobForm.status,
            role_type: jobForm.roleType,
            pay_grade: jobForm.payGrade,
            job_description: jobForm.description,
            requirements: jobForm.requirements,
            responsibilities: jobForm.responsibilities,
            benefits: jobForm.benefits
          };
        }
        return j;
      }));

      setActionSuccess(`Job posting "${jobForm.title}" updated successfully.`);
      setEditingJob(null);
      setTimeout(() => setActionSuccess(""), 4000);
    } catch (err) {
      setError(err.message || "Failed to update job posting.");
    } finally {
      setSavingEdit(false);
    }
  }

  async function handleToggleJobStatus(jobId, currentStatus) {
    const isClosed = currentStatus?.toLowerCase() === "closed";

    try {
      if (isClosed) {
        await api.patch(`/api/jobs/${jobId}/reopen`, {});
      } else {
        await api.delete(`/api/jobs/${jobId}`);
      }

      setJobs(prev => prev.map(j => {
        if (j.job_id === jobId) {
          return { ...j, job_status: isClosed ? "open" : "closed" };
        }
        return j;
      }));

      setActionSuccess(`Job posting ID ${jobId} status set to ${isClosed ? "open" : "closed"}.`);
      setTimeout(() => setActionSuccess(""), 4000);
    } catch (err) {
      setError(err.message || "Failed to update job status.");
    }
  }

  async function handleDeleteJob(jobId, jobTitle) {
    if (!window.confirm(`Are you sure you want to permanently delete job posting "${jobTitle}" (ID: ${jobId})?`)) {
      return;
    }

    try {
      await api.delete(`/api/jobs/admin/${jobId}`);
      setJobs(prev => prev.filter(j => j.job_id !== jobId));
      setActionSuccess(`Job posting "${jobTitle}" was permanently deleted.`);
      setTimeout(() => setActionSuccess(""), 4000);
    } catch (err) {
      setError(err.message || "Failed to delete job posting.");
    }
  }

  // Filtered computations
  const filteredUsers = users.filter(u => {
    const matchesSearch = (u.name || "").toLowerCase().includes(userSearch.toLowerCase()) ||
                          (u.email || "").toLowerCase().includes(userSearch.toLowerCase());
    const matchesRole = roleFilter === "all" || u.role?.toLowerCase() === roleFilter;
    return matchesSearch && matchesRole;
  });

  const filteredJobs = jobs.filter(j => {
    const matchesSearch = (j.job_title || "").toLowerCase().includes(jobSearch.toLowerCase()) ||
                          (j.company_name || "").toLowerCase().includes(jobSearch.toLowerCase()) ||
                          (j.job_location || "").toLowerCase().includes(jobSearch.toLowerCase());
    const matchesStatus = statusFilter === "all" || j.job_status?.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Metrics
  const totalUsers = users.length;
  const candidateCount = users.filter(u => u.role === "candidate").length;
  const employerCount = users.filter(u => u.role === "employer").length;
  const totalJobs = jobs.length;
  const activeJobs = jobs.filter(j => j.job_status?.toLowerCase() === "open").length;

  if (loading) {
    return (
      <div className="admin-container" style={{ textAlign: "center", padding: "4rem 1rem" }}>
        <p style={{ color: "#64748b", fontSize: "1.1rem" }}>Loading Admin Console...</p>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <div className="admin-header-section">
        <div>
          <h1 className="admin-title">Admin Console</h1>
          <p className="admin-subtitle">Manage accounts, view applicants, manage interview statuses, and moderate job postings</p>
        </div>
      </div>

      {error && <div className="auth-error" style={{ marginBottom: "1.5rem" }}>{error}</div>}
      {actionSuccess && <div style={{ background: "#dcfce7", color: "#15803d", padding: "0.75rem 1rem", borderRadius: "8px", marginBottom: "1.5rem", fontWeight: 600 }}>{actionSuccess}</div>}

      {/* Stats Overview */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ background: "#eff6ff", color: "#2563eb" }}>👥</div>
          <div>
            <div className="admin-stat-val">{totalUsers}</div>
            <div className="admin-stat-lbl">Total Users</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ background: "#e0f2fe", color: "#0284c7" }}>🎓</div>
          <div>
            <div className="admin-stat-val">{candidateCount}</div>
            <div className="admin-stat-lbl">Candidates</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ background: "#fef3c7", color: "#d97706" }}>🏢</div>
          <div>
            <div className="admin-stat-val">{employerCount}</div>
            <div className="admin-stat-lbl">Employers</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ background: "#dcfce7", color: "#16a34a" }}>💼</div>
          <div>
            <div className="admin-stat-val">{activeJobs}</div>
            <div className="admin-stat-lbl">Active Openings</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ background: "#f1f5f9", color: "#475569" }}>📄</div>
          <div>
            <div className="admin-stat-val">{totalJobs}</div>
            <div className="admin-stat-lbl">Total Postings</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="admin-tabs">
        <button
          className={`admin-tab-btn ${activeTab === "postings" ? "active" : ""}`}
          onClick={() => setActiveTab("postings")}
        >
          Job Postings ({jobs.length})
        </button>
        <button
          className={`admin-tab-btn ${activeTab === "users" ? "active" : ""}`}
          onClick={() => setActiveTab("users")}
        >
          User Accounts ({users.length})
        </button>
      </div>

      {/* Job Postings Tab */}
      {activeTab === "postings" && (
        <div>
          <div className="admin-toolbar">
            <input
              type="text"
              className="admin-search-input"
              placeholder="Search by title, company, or location..."
              value={jobSearch}
              onChange={e => setJobSearch(e.target.value)}
            />
            <select
              className="admin-filter-select"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
            </select>

            <button
              className="common-button"
              style={{ padding: "0.6rem 1.2rem", fontSize: "0.9rem", whitespace: "nowrap" }}
              onClick={() => setCreatingJob(true)}
            >
              + Post Job for Employer
            </button>
          </div>

          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Job Title</th>
                  <th>Company</th>
                  <th>Location</th>
                  <th>Work Type</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredJobs.length > 0 ? (
                  filteredJobs.map(job => {
                    const isOpen = job.job_status?.toLowerCase() === "open";
                    return (
                      <tr key={job.job_id}>
                        <td>#{job.job_id}</td>
                        <td style={{ fontWeight: 600 }}>{job.job_title}</td>
                        <td>{job.company_name || "—"}</td>
                        <td>{job.job_location || "Remote"}</td>
                        <td>{job.work_type || job.job_type || "Full-Time"}</td>
                        <td>
                          <span className={`status-badge ${isOpen ? "open" : "closed"}`}>
                            {job.job_status}
                          </span>
                        </td>
                        <td>
                          <Link
                            to={`/jobs/${job.job_id}`}
                            className="admin-action-btn admin-btn-toggle"
                            style={{ textDecoration: "none", display: "inline-block" }}
                          >
                            View
                          </Link>
                          <button
                            className="admin-action-btn admin-btn-toggle"
                            style={{ background: "#f0fdf4", color: "#166534", borderColor: "#bbf7d0" }}
                            onClick={() => openApplicantsModal(job)}
                          >
                            View Applicants
                          </button>
                          <button
                            className="admin-action-btn admin-btn-edit"
                            onClick={() => openJobEdit(job)}
                          >
                            Edit
                          </button>
                          <button
                            className="admin-action-btn admin-btn-toggle"
                            onClick={() => handleToggleJobStatus(job.job_id, job.job_status)}
                          >
                            {isOpen ? "Close" : "Reopen"}
                          </button>
                          <button
                            className="admin-action-btn admin-btn-delete"
                            onClick={() => handleDeleteJob(job.job_id, job.job_title)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center", color: "#94a3b8", padding: "2rem" }}>
                      No job postings match your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === "users" && (
        <div>
          <div className="admin-toolbar">
            <input
              type="text"
              className="admin-search-input"
              placeholder="Search by name or email..."
              value={userSearch}
              onChange={e => setUserSearch(e.target.value)}
            />
            <select
              className="admin-filter-select"
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
            >
              <option value="all">All Roles</option>
              <option value="candidate">Candidates</option>
              <option value="employer">Employers</option>
              <option value="admin">Admins</option>
            </select>

            <button
              className="common-button"
              style={{ padding: "0.6rem 1.2rem", fontSize: "0.9rem", whitespace: "nowrap" }}
              onClick={() => setCreatingUser(true)}
            >
              + Create User Account
            </button>
          </div>

          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Phone</th>
                  <th>Location</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map(u => (
                    <tr key={u.user_id}>
                      <td>#{u.user_id}</td>
                      <td style={{ fontWeight: 600 }}>{u.name}</td>
                      <td>{u.email}</td>
                      <td>
                        <span className={`role-badge ${u.role?.toLowerCase()}`}>
                          {u.role}
                        </span>
                      </td>
                      <td>{u.phone || "—"}</td>
                      <td>{u.location || "—"}</td>
                      <td>
                        <button
                          className="admin-action-btn admin-btn-edit"
                          onClick={() => openUserEdit(u)}
                        >
                          Edit
                        </button>
                        {u.role === "candidate" && (
                          <button
                            className="admin-action-btn admin-btn-toggle"
                            style={{ background: "#e0f2fe", color: "#0369a1", borderColor: "#bae6fd" }}
                            onClick={() => {
                              const cand = candidates.find(c => String(c.user_id) === String(u.user_id));
                              openApplyCandidateModal(null, cand || u);
                            }}
                          >
                            Apply to Job
                          </button>
                        )}
                        {u.user_id !== user?.id && (
                          <button
                            className="admin-action-btn admin-btn-delete"
                            onClick={() => handleDeleteUser(u.user_id, u.name)}
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center", color: "#94a3b8", padding: "2rem" }}>
                      No user accounts match your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- VIEW APPLICANTS MODAL --- */}
      {viewingApplicantsJob && (
        <div className="admin-modal-overlay" onClick={() => setViewingApplicantsJob(null)}>
          <div className="admin-modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: "750px" }}>
            <div className="admin-modal-header">
              <div>
                <h2>Applicants for #{viewingApplicantsJob.job_id} - {viewingApplicantsJob.job_title}</h2>
                <p style={{ margin: "0.25rem 0 0 0", color: "#64748b", fontSize: "0.9rem" }}>
                  Company: {viewingApplicantsJob.company_name || "—"} | Status: <span className={`status-badge ${viewingApplicantsJob.job_status?.toLowerCase()}`}>{viewingApplicantsJob.job_status}</span>
                </p>
              </div>
              <button className="admin-modal-close" onClick={() => setViewingApplicantsJob(null)}>✕</button>
            </div>

            {loadingApps ? (
              <p style={{ textAlign: "center", color: "#64748b", padding: "2rem" }}>Loading applicants...</p>
            ) : jobApplications.length > 0 ? (
              <div>
                {jobApplications.map(app => {
                  const currentStatus = (app.status || "applied").toLowerCase();
                  return (
                    <div key={app.app_id} className="applicant-card">
                      <div className="applicant-header">
                        <div>
                          <h3 className="applicant-name">{app.name}</h3>
                          <p className="applicant-email">{app.email}</p>
                        </div>
                        <span className={`status-badge ${currentStatus}`}>
                          {app.status}
                        </span>
                      </div>

                      {(app.resume_text || app.cover_letter) && (
                        <div className="applicant-details">
                          {app.resume_text && (
                            <div style={{ marginBottom: app.cover_letter ? "0.5rem" : "0" }}>
                              <strong>Resume Details:</strong> {app.resume_text}
                            </div>
                          )}
                          {app.cover_letter && (
                            <div>
                              <strong>Cover Letter:</strong> {app.cover_letter}
                            </div>
                          )}
                        </div>
                      )}

                      <div className="applicant-actions">
                        <button
                          className="admin-action-btn btn-interview"
                          onClick={() => handleUpdateAppStatus(app.app_id, "interview")}
                          disabled={currentStatus === "interview"}
                        >
                          📅 Schedule Interview
                        </button>
                        <button
                          className="admin-action-btn btn-accept"
                          onClick={() => handleUpdateAppStatus(app.app_id, "accepted")}
                          disabled={currentStatus === "accepted"}
                        >
                          ✅ Accept / Offer
                        </button>
                        <button
                          className="admin-action-btn btn-decline"
                          onClick={() => handleUpdateAppStatus(app.app_id, "rejected")}
                          disabled={currentStatus === "rejected"}
                        >
                          ❌ Decline / Reject
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "2.5rem 1rem", color: "#94a3b8" }}>
                <p style={{ fontSize: "1.05rem", margin: "0" }}>No candidates have applied to this job posting yet.</p>
              </div>
            )}

            <div className="admin-modal-actions" style={{ marginTop: "1.5rem" }}>
              <button
                type="button"
                className="admin-action-btn"
                onClick={() => setViewingApplicantsJob(null)}
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- APPLY CANDIDATE ACCOUNT TO JOB MODAL --- */}
      {applyingCandidate && (
        <div className="admin-modal-overlay" onClick={() => setApplyingCandidate(false)}>
          <div className="admin-modal-card" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>Apply Candidate Account to Job</h2>
              <button className="admin-modal-close" onClick={() => setApplyingCandidate(false)}>✕</button>
            </div>
            <form onSubmit={handleApplyCandidateSubmit} className="admin-modal-form">
              <label>
                Select Candidate Account
                <select
                  value={applyForm.candidate_id}
                  onChange={e => setApplyForm({ ...applyForm, candidate_id: e.target.value })}
                  required
                >
                  <option value="">-- Choose Candidate --</option>
                  {candidates.map(cand => (
                    <option key={cand.candidate_id} value={cand.candidate_id}>
                      {cand.name} ({cand.email})
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Select Target Job Posting
                <select
                  value={applyForm.job_id}
                  onChange={e => setApplyForm({ ...applyForm, job_id: e.target.value })}
                  required
                >
                  <option value="">-- Choose Job Posting --</option>
                  {jobs.filter(j => j.job_status?.toLowerCase() === "open").map(job => (
                    <option key={job.job_id} value={job.job_id}>
                      #{job.job_id} - {job.job_title} ({job.company_name || "Company"})
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Resume Details
                <textarea
                  rows="3"
                  value={applyForm.resume_text}
                  onChange={e => setApplyForm({ ...applyForm, resume_text: e.target.value })}
                  required
                />
              </label>

              <label>
                Cover Letter (optional)
                <textarea
                  rows="3"
                  value={applyForm.cover_letter}
                  onChange={e => setApplyForm({ ...applyForm, cover_letter: e.target.value })}
                />
              </label>

              <div className="admin-modal-actions">
                <button
                  type="button"
                  className="admin-action-btn"
                  onClick={() => setApplyingCandidate(false)}
                  disabled={savingEdit}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="common-button"
                  style={{ padding: "0.6rem 1.5rem" }}
                  disabled={savingEdit}
                >
                  {savingEdit ? "Submitting..." : "Submit Application"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- CREATE USER ACCOUNT MODAL --- */}
      {creatingUser && (
        <div className="admin-modal-overlay" onClick={() => setCreatingUser(false)}>
          <div className="admin-modal-card" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>Create New User Account</h2>
              <button className="admin-modal-close" onClick={() => setCreatingUser(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateUserSubmit} className="admin-modal-form">
              <label>
                Full Name
                <input
                  type="text"
                  value={createUserForm.name}
                  onChange={e => setCreateUserForm({ ...createUserForm, name: e.target.value })}
                  placeholder="Jane Smith"
                  required
                />
              </label>

              <label>
                Email Address
                <input
                  type="email"
                  value={createUserForm.email}
                  onChange={e => setCreateUserForm({ ...createUserForm, email: e.target.value })}
                  placeholder="you@example.com"
                  required
                />
              </label>

              <label>
                Password
                <input
                  type="password"
                  value={createUserForm.password}
                  onChange={e => setCreateUserForm({ ...createUserForm, password: e.target.value })}
                  placeholder="Min. 8 characters"
                  minLength={8}
                  required
                />
              </label>

              <div className="admin-modal-row">
                <label>
                  Account Role
                  <select
                    value={createUserForm.role}
                    onChange={e => setCreateUserForm({ ...createUserForm, role: e.target.value })}
                  >
                    <option value="candidate">Candidate</option>
                    <option value="employer">Employer</option>
                    <option value="admin">Admin</option>
                  </select>
                </label>

                <label>
                  Phone Number (optional)
                  <input
                    type="text"
                    value={createUserForm.phone}
                    onChange={e => setCreateUserForm({ ...createUserForm, phone: e.target.value })}
                    placeholder="e.g. (555) 000-0000"
                  />
                </label>
              </div>

              {createUserForm.role === "employer" && (
                <>
                  <label>
                    Company Name
                    <input
                      type="text"
                      value={createUserForm.company_name}
                      onChange={e => setCreateUserForm({ ...createUserForm, company_name: e.target.value })}
                      placeholder="Acme Inc."
                      required
                    />
                  </label>

                  <div className="admin-modal-row">
                    <label>
                      Industry (optional)
                      <input
                        type="text"
                        value={createUserForm.industry}
                        onChange={e => setCreateUserForm({ ...createUserForm, industry: e.target.value })}
                        placeholder="Software & Technology"
                      />
                    </label>

                    <label>
                      Headquarters Location (optional)
                      <input
                        type="text"
                        value={createUserForm.headquarters_location}
                        onChange={e => setCreateUserForm({ ...createUserForm, headquarters_location: e.target.value })}
                        placeholder="Toronto, ON"
                      />
                    </label>
                  </div>
                </>
              )}

              <label>
                Location (optional)
                <input
                  type="text"
                  value={createUserForm.location}
                  onChange={e => setCreateUserForm({ ...createUserForm, location: e.target.value })}
                  placeholder="e.g. Toronto, ON"
                />
              </label>

              <div className="admin-modal-actions">
                <button
                  type="button"
                  className="admin-action-btn"
                  onClick={() => setCreatingUser(false)}
                  disabled={savingEdit}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="common-button"
                  style={{ padding: "0.6rem 1.5rem" }}
                  disabled={savingEdit}
                >
                  {savingEdit ? "Creating..." : "Create Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- CREATE JOB POSTING ON BEHALF OF EMPLOYER MODAL --- */}
      {creatingJob && (
        <div className="admin-modal-overlay" onClick={() => setCreatingJob(false)}>
          <div className="admin-modal-card" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>Post Job on Behalf of Employer</h2>
              <button className="admin-modal-close" onClick={() => setCreatingJob(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateJobSubmit} className="admin-modal-form">
              <label>
                Select Employer / Company
                <select
                  value={createJobForm.employer_id}
                  onChange={e => {
                    const empId = e.target.value;
                    const selectedEmp = employers.find(emp => String(emp.employer_id) === String(empId));
                    setCreateJobForm({
                      ...createJobForm,
                      employer_id: empId,
                      company_id: selectedEmp ? selectedEmp.company_id : ""
                    });
                  }}
                  required
                >
                  <option value="">-- Choose an Employer / Company --</option>
                  {employers.map(emp => (
                    <option key={emp.employer_id} value={emp.employer_id}>
                      {emp.company_name || "Company"} (Employer: {emp.name})
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Job Title
                <input
                  type="text"
                  value={createJobForm.job_title}
                  onChange={e => setCreateJobForm({ ...createJobForm, job_title: e.target.value })}
                  placeholder="e.g. Senior Software Engineer"
                  required
                />
              </label>

              <div className="admin-modal-row">
                <label>
                  Location
                  <input
                    type="text"
                    value={createJobForm.job_location}
                    onChange={e => setCreateJobForm({ ...createJobForm, job_location: e.target.value })}
                    placeholder="Remote / City"
                    required
                  />
                </label>

                <label>
                  Status
                  <select
                    value={createJobForm.job_status}
                    onChange={e => setCreateJobForm({ ...createJobForm, job_status: e.target.value })}
                  >
                    <option value="open">Open (Hiring)</option>
                    <option value="closed">Closed</option>
                  </select>
                </label>
              </div>

              <div className="admin-modal-row">
                <label>
                  Work Type
                  <select
                    value={createJobForm.work_type}
                    onChange={e => setCreateJobForm({ ...createJobForm, work_type: e.target.value })}
                  >
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="On-site">On-site</option>
                  </select>
                </label>

                <label>
                  Job Type
                  <select
                    value={createJobForm.job_type}
                    onChange={e => setCreateJobForm({ ...createJobForm, job_type: e.target.value })}
                  >
                    <option value="Full-Time">Full-Time</option>
                    <option value="Part-Time">Part-Time</option>
                    <option value="Co-op">Co-op</option>
                    <option value="Contract">Contract</option>
                  </select>
                </label>
              </div>

              <div className="admin-modal-row">
                <label>
                  Role Type
                  <select
                    value={createJobForm.role_type}
                    onChange={e => setCreateJobForm({ ...createJobForm, role_type: e.target.value })}
                  >
                    <option value="Full-Time">Full-Time</option>
                    <option value="Part-Time">Part-Time</option>
                    <option value="Co-op">Co-op</option>
                  </select>
                </label>

                <label>
                  Pay Grade
                  <select
                    value={createJobForm.pay_grade}
                    onChange={e => setCreateJobForm({ ...createJobForm, pay_grade: e.target.value })}
                  >
                    <option value="Grade 1">Grade 1</option>
                    <option value="Grade 2">Grade 2</option>
                    <option value="Grade 3">Grade 3</option>
                    <option value="Grade 4">Grade 4</option>
                  </select>
                </label>
              </div>

              <label>
                Description
                <textarea
                  rows="3"
                  value={createJobForm.job_description}
                  onChange={e => setCreateJobForm({ ...createJobForm, job_description: e.target.value })}
                  placeholder="Detailed job description..."
                  required
                />
              </label>

              <label>
                Requirements (optional)
                <textarea
                  rows="2"
                  value={createJobForm.requirements}
                  onChange={e => setCreateJobForm({ ...createJobForm, requirements: e.target.value })}
                  placeholder="Key qualifications & skills..."
                />
              </label>

              <label>
                Responsibilities (optional)
                <textarea
                  rows="2"
                  value={createJobForm.responsibilities}
                  onChange={e => setCreateJobForm({ ...createJobForm, responsibilities: e.target.value })}
                  placeholder="Day-to-day duties..."
                />
              </label>

              <label>
                Benefits (optional)
                <textarea
                  rows="2"
                  value={createJobForm.benefits}
                  onChange={e => setCreateJobForm({ ...createJobForm, benefits: e.target.value })}
                  placeholder="Perks, health coverage, bonuses..."
                />
              </label>

              <div className="admin-modal-actions">
                <button
                  type="button"
                  className="admin-action-btn"
                  onClick={() => setCreatingJob(false)}
                  disabled={savingEdit}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="common-button"
                  style={{ padding: "0.6rem 1.5rem" }}
                  disabled={savingEdit}
                >
                  {savingEdit ? "Posting..." : "Create Job Posting"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- USER EDIT MODAL --- */}
      {editingUser && (
        <div className="admin-modal-overlay" onClick={() => setEditingUser(null)}>
          <div className="admin-modal-card" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>Edit User Account #{editingUser.user_id}</h2>
              <button className="admin-modal-close" onClick={() => setEditingUser(null)}>✕</button>
            </div>
            <form onSubmit={handleSaveUser} className="admin-modal-form">
              <label>
                Full Name
                <input
                  type="text"
                  value={userForm.name}
                  onChange={e => setUserForm({ ...userForm, name: e.target.value })}
                  required
                />
              </label>

              <label>
                Email Address
                <input
                  type="email"
                  value={userForm.email}
                  onChange={e => setUserForm({ ...userForm, email: e.target.value })}
                  required
                />
              </label>

              <label>
                Reset Password (leave blank to keep current)
                <input
                  type="password"
                  value={userForm.newPassword}
                  onChange={e => setUserForm({ ...userForm, newPassword: e.target.value })}
                  placeholder="Enter new password (min. 8 chars)"
                  minLength={8}
                />
              </label>

              <div className="admin-modal-row">
                <label>
                  Role
                  <select
                    value={userForm.role}
                    onChange={e => setUserForm({ ...userForm, role: e.target.value })}
                  >
                    <option value="candidate">Candidate</option>
                    <option value="employer">Employer</option>
                    <option value="admin">Admin</option>
                  </select>
                </label>

                <label>
                  Phone Number
                  <input
                    type="text"
                    value={userForm.phone}
                    onChange={e => setUserForm({ ...userForm, phone: e.target.value })}
                    placeholder="e.g. (555) 000-0000"
                  />
                </label>
              </div>

              <label>
                Location
                <input
                  type="text"
                  value={userForm.location}
                  onChange={e => setUserForm({ ...userForm, location: e.target.value })}
                  placeholder="e.g. Toronto, ON"
                />
              </label>

              {userForm.role === "employer" && (
                <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px dashed #cbd5e1" }}>
                  <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#1e293b", margin: "0 0 0.75rem 0" }}>Employer Company Details</h3>
                  
                  <label style={{ marginBottom: "0.75rem" }}>
                    Company Name
                    <input
                      type="text"
                      value={userForm.company_name}
                      onChange={e => setUserForm({ ...userForm, company_name: e.target.value })}
                      placeholder="e.g. Acme Corp"
                    />
                  </label>

                  <div className="admin-modal-row" style={{ marginBottom: "0.75rem" }}>
                    <label>
                      Industry
                      <input
                        type="text"
                        value={userForm.industry}
                        onChange={e => setUserForm({ ...userForm, industry: e.target.value })}
                        placeholder="e.g. Technology"
                      />
                    </label>

                    <label>
                      Company Size
                      <select
                        value={userForm.company_size}
                        onChange={e => setUserForm({ ...userForm, company_size: e.target.value })}
                      >
                        <option value="1-10 Employees">1-10 Employees</option>
                        <option value="11-50 Employees">11-50 Employees</option>
                        <option value="51-200 Employees">51-200 Employees</option>
                        <option value="201-500 Employees">201-500 Employees</option>
                        <option value="500+ Employees">500+ Employees</option>
                      </select>
                    </label>
                  </div>

                  <div className="admin-modal-row" style={{ marginBottom: "0.75rem" }}>
                    <label>
                      Headquarters Location
                      <input
                        type="text"
                        value={userForm.headquarters_location}
                        onChange={e => setUserForm({ ...userForm, headquarters_location: e.target.value })}
                        placeholder="e.g. San Francisco, CA"
                      />
                    </label>

                    <label>
                      Company Website
                      <input
                        type="text"
                        value={userForm.company_website}
                        onChange={e => setUserForm({ ...userForm, company_website: e.target.value })}
                        placeholder="e.g. https://example.com"
                      />
                    </label>
                  </div>

                  <label>
                    Company Description
                    <textarea
                      rows="2"
                      value={userForm.company_description}
                      onChange={e => setUserForm({ ...userForm, company_description: e.target.value })}
                      placeholder="Company summary..."
                    />
                  </label>
                </div>
              )}

              <div className="admin-modal-actions">
                <button
                  type="button"
                  className="admin-action-btn"
                  onClick={() => setEditingUser(null)}
                  disabled={savingEdit}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="common-button"
                  style={{ padding: "0.6rem 1.5rem" }}
                  disabled={savingEdit}
                >
                  {savingEdit ? "Saving..." : "Save User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- JOB EDIT MODAL --- */}
      {editingJob && (
        <div className="admin-modal-overlay" onClick={() => setEditingJob(null)}>
          <div className="admin-modal-card" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>Edit Job Posting #{editingJob.job_id}</h2>
              <button className="admin-modal-close" onClick={() => setEditingJob(null)}>✕</button>
            </div>
            <form onSubmit={handleSaveJob} className="admin-modal-form">
              <label>
                Job Title
                <input
                  type="text"
                  value={jobForm.title}
                  onChange={e => setJobForm({ ...jobForm, title: e.target.value })}
                  required
                />
              </label>

              <div className="admin-modal-row">
                <label>
                  Location
                  <input
                    type="text"
                    value={jobForm.location}
                    onChange={e => setJobForm({ ...jobForm, location: e.target.value })}
                    required
                  />
                </label>

                <label>
                  Status
                  <select
                    value={jobForm.status}
                    onChange={e => setJobForm({ ...jobForm, status: e.target.value })}
                  >
                    <option value="open">Open (Hiring)</option>
                    <option value="closed">Closed</option>
                  </select>
                </label>
              </div>

              <div className="admin-modal-row">
                <label>
                  Work Type
                  <select
                    value={jobForm.workType}
                    onChange={e => setJobForm({ ...jobForm, workType: e.target.value })}
                  >
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="On-site">On-site</option>
                  </select>
                </label>

                <label>
                  Job Type
                  <select
                    value={jobForm.jobType}
                    onChange={e => setJobForm({ ...jobForm, jobType: e.target.value })}
                  >
                    <option value="Full-Time">Full-Time</option>
                    <option value="Part-Time">Part-Time</option>
                    <option value="Co-op">Co-op</option>
                    <option value="Contract">Contract</option>
                  </select>
                </label>
              </div>

              <div className="admin-modal-row">
                <label>
                  Role Type
                  <select
                    value={jobForm.roleType}
                    onChange={e => setJobForm({ ...jobForm, roleType: e.target.value })}
                  >
                    <option value="Full-Time">Full-Time</option>
                    <option value="Part-Time">Part-Time</option>
                    <option value="Co-op">Co-op</option>
                  </select>
                </label>

                <label>
                  Pay Grade
                  <select
                    value={jobForm.payGrade}
                    onChange={e => setJobForm({ ...jobForm, payGrade: e.target.value })}
                  >
                    <option value="Grade 1">Grade 1</option>
                    <option value="Grade 2">Grade 2</option>
                    <option value="Grade 3">Grade 3</option>
                    <option value="Grade 4">Grade 4</option>
                  </select>
                </label>
              </div>

              <label>
                Description
                <textarea
                  rows="3"
                  value={jobForm.description}
                  onChange={e => setJobForm({ ...jobForm, description: e.target.value })}
                  required
                />
              </label>

              <label>
                Requirements
                <textarea
                  rows="2"
                  value={jobForm.requirements}
                  onChange={e => setJobForm({ ...jobForm, requirements: e.target.value })}
                />
              </label>

              <label>
                Responsibilities
                <textarea
                  rows="2"
                  value={jobForm.responsibilities}
                  onChange={e => setJobForm({ ...jobForm, responsibilities: e.target.value })}
                />
              </label>

              <label>
                Benefits
                <textarea
                  rows="2"
                  value={jobForm.benefits}
                  onChange={e => setJobForm({ ...jobForm, benefits: e.target.value })}
                />
              </label>

              <div className="admin-modal-actions">
                <button
                  type="button"
                  className="admin-action-btn"
                  onClick={() => setEditingJob(null)}
                  disabled={savingEdit}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="common-button"
                  style={{ padding: "0.6rem 1.5rem" }}
                  disabled={savingEdit}
                >
                  {savingEdit ? "Saving..." : "Save Job Posting"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
