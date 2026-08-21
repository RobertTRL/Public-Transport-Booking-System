
function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <span>HopOn</span>
      </div>

      <div className="navbar-links">
        <a href="/">Home</a>
        <a href="#routes">Routes</a>
        <a href="#bookings">My Bookings</a>
      </div>

      <div className="navbar-actions">
        <button className="login-button">Login</button>
        <button className="signup-button">Sign Up</button>
      </div>
    </nav>
  );
}

export default Navbar;
