import { useState } from "react";
import Navbar from "../components/Navbar";
import Map from "../components/Map";
import { useNavigate } from "react-router-dom";

const transportLocations = [
  {
    id: 1,
    name: "Nairobi CBD",
    position: [-1.286389, 36.817223],
    type: "Main Terminal",
    description: "Central Nairobi pickup and drop-off point.",
  },
  {
    id: 2,
    name: "Westlands",
    position: [-1.2676, 36.8108],
    type: "Transport Stop",
    description: "Popular passenger pickup point serving Westlands.",
  },
  {
    id: 3,
    name: "Ngong Road",
    position: [-1.3008, 36.7876],
    type: "Transport Stop",
    description: "Passenger pickup point serving Ngong Road.",
  },
  {
    id: 4,
    name: "Kasarani",
    position: [-1.2219, 36.8976],
    type: "Transport Stop",
    description: "Passenger pickup point serving Kasarani.",
  },
];

const transportRoutes = [
  {
    id: 1,
    name: "CBD → Westlands",
    positions: [
      [-1.286389, 36.817223],
      [-1.2676, 36.8108],
    ],
    description: "Route connecting Nairobi CBD and Westlands.",
  },
  {
    id: 2,
    name: "CBD → Ngong Road",
    positions: [
      [-1.286389, 36.817223],
      [-1.3008, 36.7876],
    ],
    description: "Route connecting Nairobi CBD and Ngong Road.",
  },
  {
    id: 3,
    name: "CBD → Kasarani",
    positions: [
      [-1.286389, 36.817223],
      [-1.2219, 36.8976],
    ],
    description: "Route connecting Nairobi CBD and Kasarani.",
  },
];

function Home() {
  const [searchTerm, setSearchTerm] = useState("")
  const navigate = useNavigate()

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    // navigate("/booking/map");
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

        <section className="map-section">
          <div>
            <p className="section-label">MAP</p>

            <h2>Explore routes on the map</h2>

            <p>
              View routes and stops across Nairobi directly on the map.
            </p>
          </div>

          <div className="map-wrapper">
            <Map locations={transportLocations} />
          </div>
        </section>
      </main>
    </div>
  );
}

export default Home;