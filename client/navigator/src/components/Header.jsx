import "../styles/header.css";
import "../styles/common.css";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  const initials = user?.name
    ? user.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)
    : null;

  return (
    <header className="header">
      <div className="header-left">
        <div>💼</div>
        <h2>Navigator</h2>
      </div>

      <nav className="header-center">
        <Link to="/">Home</Link>
        <p> | </p>
        <Link to="/jobs">Jobs</Link>
        {user && (
          <>
            <p> | </p>
            <Link to="/dashboard">
              {user.role === "admin" ? "Admin Console" : "Dashboard"}
            </Link>
          </>
        )}
      </nav>

      <div className="header-right">
        {user ? (
          <>
            <Link to="/account" style={{ textDecoration: "none" }}>
              <div className="profile" title={`Manage Account (${user.name})`}>{initials}</div>
            </Link>
            <button className="common-button" onClick={handleLogout}>Sign out</button>
          </>
        ) : (
          <Link to="/login">
            <button className="common-button">Login / Register</button>
          </Link>
        )}
      </div>
    </header>
  );
}

export default Header;