
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../api/apiClient.js";
import { useAuth } from "../context/AuthContext.jsx";
import "../styles/auth.css";

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "candidate",
    company_name: "",
    industry: "",
    headquarters_location: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasAdmin, setHasAdmin] = useState(true);

  useEffect(() => {
    api.get("/api/users/admin-exists")
      .then(res => {
        setHasAdmin(!!res.adminExists);
      })
      .catch(() => setHasAdmin(true));
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await api.post("/api/users/register", form);
      login({ id: data.id, name: data.name, email: data.email, role: data.role }, data.token);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-logo">💼</div>
        <h1 className="auth-title">Create your account</h1>
        <p className="auth-subtitle">Start your job search with Navigator</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            Full name
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Jane Smith"
              required
            />
          </label>

          <label>
            Email
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Min. 8 characters"
              minLength={8}
              required
            />
          </label>

          <label>
            I am a
            <select name="role" value={form.role} onChange={handleChange} required>
              <option value="candidate">Candidate</option>
              <option value="employer">Employer</option>
              {!hasAdmin && <option value="admin">Admin</option>}
            </select>
          </label>

          {form.role === "employer" && (
            <>
              <label>
                Company name
                <input
                  type="text"
                  name="company_name"
                  value={form.company_name}
                  onChange={handleChange}
                  placeholder="Acme Inc."
                  required
                />
              </label>

              <label>
                Industry
                <input
                  type="text"
                  name="industry"
                  value={form.industry}
                  onChange={handleChange}
                  placeholder="Software (optional)"
                />
              </label>

              <label>
                Headquarters location
                <input
                  type="text"
                  name="headquarters_location"
                  value={form.headquarters_location}
                  onChange={handleChange}
                  placeholder="Toronto, ON (optional)"
                />
              </label>
            </>
          )}

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}