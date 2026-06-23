import "../styles/header.css"
import "../styles/common.css"
import { Link } from "react-router-dom";
function Header() {

    return (
        <header className="header">

            <div className="header-left">
                <div>💼</div>
                <h2>Navigator</h2>
            </div>


            <nav className="header-center">
                <Link to="/">Home</Link>
                <p> | </p>
                <Link to="/">Jobs</Link>
                <p> | </p>
                <Link to="/">Applications</Link>
            </nav>

            <div className="header-right">
                <div className="profile">M</div>
                <button className="common-button">Login / Register</button>

            </div>

        </header>
    )
}

export default Header;