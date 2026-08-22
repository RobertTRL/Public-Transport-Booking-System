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
    navigate(`/home/map?from=${origin.id}&to=${destination.id}`);
  }

  return (
    <div className="home-page">
      <section className="home-hero">
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

      <section className="home-routes" id="routes">
        <div className="home-routes__intro">
          <p className="home-section-label">EXPLORE</p>
          <h2>Find your route</h2>
          <p className="home-section-text">
            Every highway on the map, colour-coded the same way you'll see it
            once you're picking stops.
          </p>
        </div>

        <div className="home-routes__grid">
          {routeHighlights.map((route, index) => (
            <motion.div
              key={route.id}
              className="home-route-card"
              style={{ "--route-color": route.color }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.6, delay: index * 0.08, ease: "easeOut" }}
            >
              <span className="home-route-card__dot" />
              <h3>{route.name}</h3>
              <p>{route.stops}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="home-steps">
        <div className="home-steps__intro">
          <p className="home-section-label">HOW IT WORKS</p>
          <h2>Three steps to your stop</h2>
        </div>

        <div className="home-steps__grid">
          {steps.map((step) => (
            <div className="home-step" key={step.number}>
              <span className="home-step__number">{step.number}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Home;