import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import RouteSearch from "../RouteSearch";
import "../../styles/home.css";

// ...routeHighlights and steps arrays stay the same...

function Home() {
  const navigate = useNavigate();
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);

  function handleSelectOrigin(stop) {
    setOrigin(stop);
    setDestination(null);
  }

  function handleSelectDestination(stop) {
    if (origin && stop.id === origin.id) return;
    setDestination(stop);
  }

  function handleFindVehicles(event) {
    event.preventDefault();
    if (!origin || !destination) return;
    navigate(`/booking/map?from=${origin.id}&to=${destination.id}`);
  }

  return (
    <div className="home-page">
      <section className="home-hero">
        <motion.p
          className="home-hero__label"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          HopOn
        </motion.p>

        <motion.h1
          className="home-hero__title"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
        >
          Move around Nairobi
          <br />
          with ease.
        </motion.h1>

        <motion.p
          className="home-hero__text"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
        >
          Find routes, discover stops and book your next matatu or bus trip
          from one place.
        </motion.p>

        <motion.form
          className="home-search"
          onSubmit={handleFindVehicles}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
        >
          <RouteSearch
            origin={origin}
            destination={destination}
            onSelectOrigin={handleSelectOrigin}
            onSelectDestination={handleSelectDestination}
          />

          <button
            type="submit"
            className="home-search__button"
            disabled={!origin || !destination}
          >
            Find Vehicles
          </button>
        </motion.form>
      </section>

      {/* home-routes and home-steps sections unchanged */}
    </div>
  );
}

export default Home;