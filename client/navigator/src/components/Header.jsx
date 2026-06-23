import "../styles/header.css"
import { Link } from "react-router-dom";
function Header() {
    return (
        <header className="header">
            <div className="box-content">
                <h1>Navigator</h1>
                <h5>Navigator clone</h5>
            </div>
            <nav className="nav-content">
                <Link to="/">Job Search</Link>
                <p> | </p>
                <Link to="/">My jobs</Link>
            </nav>

        </header>
    )
}

export default Header;