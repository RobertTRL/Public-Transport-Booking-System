import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import RouteSearch from "../RouteSearch";
import Map from "../maprelated/Map";
import { allStops } from "../../data/nairobiRoutes";
import { getRouteSelection } from "../../utils/routeSelection";

function HowItWorks() {
  const [searchParams] = useSearchParams();
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);

  useEffect(() => {
    const fromId = searchParams.get("from");
    const toId = searchParams.get("to");
    if (!fromId && !toId) return;

    const fromStop = allStops.find((stop) => stop.id === fromId);
    const toStop = allStops.find((stop) => stop.id === toId);

    if (fromStop) setOrigin(fromStop);
    if (toStop) setDestination(toStop);
    // Only meant to seed initial state from Home's search handoff — after this,
    // dropdown/map clicks own origin/destination, so deps are intentionally empty.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      <main>
        <section className="how-it-works">
          <div className="how-it-works__card">
            <div className="how-it-works__intro">
              <h1 className="how-it-works__title">1. Plan your route.</h1>
              <p className="how-it-works__description">
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

            <div className="how-it-works__map">
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