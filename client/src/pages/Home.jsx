import Navbar from "../components/Navbar";

function Home() {
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

            <div className="search-card">
              <div className="search-field">
                <label htmlFor="origin">From</label>
                <input
                  id="origin"
                  type="text"
                  placeholder="Enter your starting point"
                />
              </div>

              <div className="search-field">
                <label htmlFor="destination">To</label>
                <input
                  id="destination"
                  type="text"
                  placeholder="Where are you going?"
                />
              </div>

              <button className="search-button">
                Search Routes
              </button>
            </div>
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

        <section className="map-section">
          <div>
            <p className="section-label">MAP</p>
            <h2>Explore routes on the map</h2>
            <p>
              Soon you'll be able to view routes and stops across Nairobi
              directly on the map.
            </p>
          </div>

          <div className="map-placeholder">
            <p>Map coming soon</p>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Home;
