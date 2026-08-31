import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, Clock, ShieldCheck, ArrowRight } from "lucide-react";
import RouteSearch from "../RouteSearch";
import homeData from "../../data/homeData.json";
import "../../styles/home.css";

// Map icon names to components
const iconMap = {
  Search,
  MapPin,
  Clock,
  ShieldCheck,
};

const { steps, stats, features } = homeData;

function Home() {
  const navigate = useNavigate();
  const [routes, setRoutes] = useState([]);
  const [stops, setStops] = useState([]);
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  const [route, setRoute] = useState(null);
  const [loadingRoutes, setLoadingRoutes] = useState(false);
  const [loadingStops, setLoadingStops] = useState(false);

  // Fetch all routes on component mount
  useEffect(() => {
    const fetchRoutes = async () => {
      setLoadingRoutes(true);
      try {
        const response = await fetch("/api/v1/routes/generalinfo");
        if (response.ok) {
          const data = await response.json();
          setRoutes(data.items || []);
        } else {
          console.error("Failed to fetch routes");
        }
      } catch (error) {
        console.error("Error fetching routes:", error);
      } finally {
        setLoadingRoutes(false);
      }
    };

    fetchRoutes();
  }, []);

  // Fetch stops for selected route
  useEffect(() => {
    if (!route) {
      setStops([]);
      setOrigin(null);
      setDestination(null);
      return;
    }

    const fetchStops = async () => {
      setLoadingStops(true);
      try {
        const response = await fetch(`/api/v1/routes/${route.id}/stops`);
        if (response.ok) {
          const data = await response.json();
          setStops(data.items || []);
        } else {
          console.error("Failed to fetch stops");
        }
      } catch (error) {
        console.error("Error fetching stops:", error);
      } finally {
        setLoadingStops(false);
      }
    };

    fetchStops();
  }, [route]);

  const handleSelectRoute = (selectedRoute) => {
    setRoute(selectedRoute);
    setOrigin(null);
    setDestination(null);
  };

  const handleSelectOrigin = (stop) => {
    setOrigin(stop);
    setDestination(null);
  };

  function handleSelectDestination(stop) {
    if (origin && stop.id === origin.id) return;
    setDestination(stop);
  }

  async function handleFindVehicles(event) {
    event.preventDefault();
    if (!origin || !destination || !route) return;

    try {
      // Get today's date in YYYY-MM-DD format
      const today = new Date().toISOString().split("T")[0];

      // Make API call to fetch trips
      const response = await fetch(
        `/api/v1/trips?origin_routestop_id=${origin.id}&destination_routestop_id=${destination.id}&date=${today}`
      );

      if (response.ok) {
        // Navigate to find vehicles page with the stop IDs and route ID
        navigate(
          `/home/map?route=${route.id}&from=${origin.id}&to=${destination.id}`
        );
      } else {
        const error = await response.json();
        console.error("Failed to fetch trips:", error);
      }
    } catch (error) {
      console.error("Error fetching trips:", error);
    }
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
            routes={routes}
            stops={stops}
            onSelectRoute={handleSelectRoute}
            onSelectOrigin={handleSelectOrigin}
            onSelectDestination={handleSelectDestination}
            loadingRoutes={loadingRoutes}
            loadingStops={loadingStops}
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
          {features.map((feature, index) => {
            const IconComponent = iconMap[feature.icon];
            return (
              <motion.div
                className="home-feature-card"
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.55, delay: index * 0.08, ease: "easeOut" }}
              >
                <span className="home-feature-card__icon">
                  {IconComponent && <IconComponent size={22} />}
                </span>
                <h3>{feature.title}</h3>
                <p>{feature.text}</p>
              </motion.div>
            );
          })}
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
