import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import RouteSearch from "../RouteSearch";
import "../../styles/home.css";

const routeHighlights = [
  { id: "thika-road", name: "CBD → Thika Road", color: "#e63946", stops: "7 stops" },
  { id: "mombasa-road", name: "CBD → Mombasa Road", color: "#1a73e8", stops: "6 stops" },
  { id: "waiyaki-way", name: "CBD → Waiyaki Way", color: "#2a9d8f", stops: "6 stops" },
  { id: "ngong-road", name: "CBD → Ngong Road", color: "#f4a261", stops: "4 stops" },
];

const steps = [
  {
    number: "01",
    title: "Search your route",
    text: "Tell us where you're headed and we'll show the highways and stops that get you there.",
  },
  {
    number: "02",
    title: "Pick your stop",
    text: "Choose the pickup and drop-off points closest to you on the route.",
  },
  {
    number: "03",
    title: "Book & go",
    text: "Confirm your trip and you're set — no queuing at the stage.",
  },
];

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
