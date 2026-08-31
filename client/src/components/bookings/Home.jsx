import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, Clock, ShieldCheck, ArrowRight } from "lucide-react";
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

const stats = [
  { value: "120+", label: "Routes covered" },
  { value: "500+", label: "Stops mapped" },
  { value: "10k+", label: "Riders monthly" },
  { value: "4.8★", label: "Avg. rating" },
];

const features = [
  {
    icon: Search,
    title: "Smart route search",
    text: "Type any two stops and we'll map the quickest matatu and bus connections across the city.",
  },
  {
    icon: MapPin,
    title: "Stop-by-stop guidance",
    text: "See every stage on the way so you always know exactly where to hop on and off.",
  },
  {
    icon: Clock,
    title: "Live departures",
    text: "Get realistic departure times and never miss the matatu that gets you there on time.",
  },
  {
    icon: ShieldCheck,
    title: "Safe & trusted",
    text: "Verified operators and transparent fares, so your daily commute stays predictable.",
  },
];

function Home() {
  const navigate = useNavigate();
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  const [route, setRoute] = useState(null);

  const handleSelectRoute = (selectedRoute) => {
    setRoute(selectedRoute);
    setOrigin(null);
    setDestination(null);
  };

  const handleSelectOrigin = (stop) => {
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
        <motion.span
          className="home-hero__label"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          Nairobi's travel companion
        </motion.span>

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
            route={route}
            origin={origin}
            destination={destination}
            onSelectRoute={handleSelectRoute}
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

        <motion.div
          className="home-hero__stats"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4, ease: "easeOut" }}
        >
          {stats.map((stat) => (
            <div className="home-stat" key={stat.label}>
              <span className="home-stat__value">{stat.value}</span>
              <span className="home-stat__label">{stat.label}</span>
            </div>
          ))}
        </motion.div>
      </section>

      <section className="home-features" id="features">
        <div className="home-section-head">
          <p className="home-section-label">Why HopOn</p>
          <h2>Everything you need for the ride</h2>
          <p className="home-section-text">
            Built for Nairobi commuters — from the first search to the final
            stop.
          </p>
        </div>

        <div className="home-features__grid">
          {features.map((feature, index) => (
            <motion.div
              className="home-feature-card"
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.55, delay: index * 0.08, ease: "easeOut" }}
            >
              <span className="home-feature-card__icon">
                <feature.icon size={22} />
              </span>
              <h3>{feature.title}</h3>
              <p>{feature.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="home-routes" id="routes">
        <div className="home-routes__intro">
          <p className="home-section-label">Explore</p>
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

        <div className="home-routes__footer">
          <button
            type="button"
            className="home-link-button"
            onClick={() => navigate("/home/map")}
          >
            View live map
            <ArrowRight size={16} />
          </button>
        </div>
      </section>

      <section className="home-steps">
        <div className="home-steps__intro">
          <p className="home-section-label">How it works</p>
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

      <section className="home-cta">
        <div className="home-cta__inner">
          <h2>Ready to ride?</h2>
          <p>Book your first trip in under a minute — no queues, no guesswork.</p>
          <button
            type="button"
            className="home-cta__button"
            onClick={() => navigate("/home/map")}
          >
            Open live map
            <ArrowRight size={16} />
          </button>
        </div>
      </section>
    </div>
  );
}

export default Home;
