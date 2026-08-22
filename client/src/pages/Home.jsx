import { useState } from "react";
import Navbar from "../components/Navbar";

function Home() {
  const [searchTerm, setSearchTerm] = useState("")

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    console.log("Searching for:", searchTerm);
  };
  return (
    <div className="home-page">
      <Navbar />

      <main>
        <section className="hero">
          <div className="hero-content">
            <p className="hero-label">HopOn</p>

            <h1>
              Move around Nairobi
              <br />
              with ease.
            </h1>

            <p className="hero-text">
              Find routes, discover stops and book your next matatu or bus
              trip from one place.
            </p>

            <form className="search-card" onSubmit={handleSearchSubmit}>
              <div className="search-field">
                <label htmlFor="search">Destination / Route</label>
                <input
                  id="search"
                  type="text"
                  placeholder="Where are you going?"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
              </div>

              <button type="submit" className="search-button">
                Search Routes
              </button>
            </form>
          </div>
        </section>

        <section className="routes-section" id="routes">
          <div>
            <p className="section-label">EXPLORE</p>

            <h2>Find your route</h2>

            <p>
              Search for available public transport routes across Nairobi
              and find the option that works best for you.
            </p>
          </div>

          <div className="route-cards">
            <div className="route-card">
              <h3>CBD → Westlands</h3>
              <p>Multiple stops available</p>
            </div>

            <div className="route-card">
              <h3>CBD → Ngong Road</h3>
              <p>Multiple stops available</p>
            </div>

            <div className="route-card">
              <h3>CBD → Kasarani</h3>
              <p>Multiple stops available</p>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}

export default Home;