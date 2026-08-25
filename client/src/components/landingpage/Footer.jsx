import { NavLink } from "react-router-dom"
import '../../styles/footer.css'

function Footer() {
    const currentYear = new Date().getFullYear();

    return(
        <footer className="footer">
            <div className="footer-content">
                <div className="footer-top">
                    <div className="footer-brand">
                        <h2>HopOn!</h2>
                        <p>Real-time public transport routes, stops, and seat reservations - for riders and service providers alike.</p>
                    </div>

                    <div className="footer-links">
                        <div className="footer-col">
                            <h3>Product</h3>
                            <ul>
                                <li><NavLink to="/book/login">Book a Ride</NavLink></li>
                                <li><NavLink to="/login">Dashboard Login</NavLink></li>
                            </ul>
                        </div>

                        <div className="footer-col">
                            <h3>Company</h3>
                            <ul>
                                <li><NavLink to="/about">About</NavLink></li>
                                <li><NavLink to="/contact">Contact</NavLink></li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>Copyright &copy; {currentYear} HopOn! All rights reserved.</p>
                    <div className="footer-socials">
                        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">Twitter</a>
                        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">Instagram</a>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer