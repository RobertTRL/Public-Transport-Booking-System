import { NavLink } from "react-router-dom"
import "../../styles/header.css"

function Header() {
    return(
        <header className="header">
            <div className="header-content">
                <h1>Hop On!</h1>
                <NavLink to="/book" className="header-cta">
                    Book a Ride
                </NavLink>
            </div>
        </header>
    )
}

export default Header