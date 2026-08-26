import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import RouteSearch from "../RouteSearch";
import Map from "../maprelated/Map";
import { getStopById } from "../../data/nairobiRoutes";
import { getRouteSelection, getVisibleStops } from "../../utils/routeSelection";

function HowItWorks() {
  const [searchParams] = useSearchParams();

  // Seed initial state from URL search params (Home handoff)
  const initialOrigin = getStopById(searchParams.get("from"));
  const initialDestination = getStopById(searchParams.get("to"));

  const [origin, setOrigin] = useState(initialOrigin);
  const [destination, setDestination] = useState(initialDestination);

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
    if (stop !== null) setDestination(null);
  }

  function handleSelectDestination(stop) {
    if (stop && origin && stop.id === origin.id) return;
    setDestination(stop);
  }

  const selection = useMemo(() => getRouteSelection(origin, destination), [origin, destination]);
  const visibleStops = useMemo(() => getVisibleStops(selection), [selection]);

  return (
    <div className="how-it-works-page">
      <main>
        <section className="how-it-works">
          <div className="how-it-works__card">
            <div className="how-it-works__intro">
              <h1 className="how-it-works__title">
                1. Plan your route.
              </h1>

              <p className="how-it-works__description">
                Pick where you're starting from and where you're headed,
                and we'll show you the route.
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
                stops={visibleStops}
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