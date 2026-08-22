import { useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import RouteSearch from "../components/RouteSearch";
import Map from "../components/Map";
import { allStops } from "../data/nairobiRoutes";
import { getRouteSelection } from "../utils/routeSelection";

function HowItWorks() {
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);

  function handleSelectStop(stop) {
    if (!origin || (origin && destination)) {
      setOrigin(stop);
      setDestination(null);
      return;
    }
    if (stop.id === origin.id) return;
    setDestination(stop);
  }

  function handleSelectOrigin(stop) {
    setOrigin(stop);
    setDestination(null);
  }

  function handleSelectDestination(stop) {
    if (origin && stop.id === origin.id) return;
    setDestination(stop);
  }

  const selection = useMemo(() => getRouteSelection(origin, destination), [origin, destination]);

  return (
    <div className="how-it-works-page">
      <Navbar />

      <main>
        <section className="problem">
          <div className="problem__inner">
            <div className="problem__text">
              <p className="section-label">HOW IT WORKS</p>
              <h1 className="problem__title">Plan your route</h1>
              <p className="problem__description">
                Pick where you're starting from and where you're headed, and we'll show you the
                route.
              </p>
            </div>

            <RouteSearch
              origin={origin}
              destination={destination}
              onSelectOrigin={handleSelectOrigin}
              onSelectDestination={handleSelectDestination}
            />

            <div className="map-wrapper">
              <Map
                stops={allStops}
                origin={origin}
                destination={destination}
                highlightedStopIds={selection?.highlightedStopIds || []}
                waypoints={selection?.waypoints}
                onSelectStop={handleSelectStop}
              />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default HowItWorks;