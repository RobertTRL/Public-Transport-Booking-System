import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import RouteSearch from "../RouteSearch";
import Map from "../maprelated/Map";
import { getStopById, getRouteById, getRouteForStop, allRoutes } from "../../data/nairobiRoutes";
import { getRouteSelection, getVisibleStops } from "../../utils/routeSelection";

function HowItWorks() {
  const [searchParams] = useSearchParams();

  // Seed initial state from URL search params (Home handoff)
  const initialOrigin = getStopById(searchParams.get("from"));
  const initialOriginRoute = initialOrigin ? getRouteForStop(initialOrigin.id) : null;
  // Normalize to the same shape RouteDropdown's options use
  const initialRoute = initialOriginRoute
    ? allRoutes.find((r) => r.id === initialOriginRoute.id) || null
    : null;

  const initialDestinationCandidate = getStopById(searchParams.get("to"));
  // Only keep the seeded destination if it actually belongs to the seeded route
  const initialDestination =
    initialDestinationCandidate &&
    initialOriginRoute?.stops.some((s) => s.id === initialDestinationCandidate.id)
      ? initialDestinationCandidate
      : null;

  const [route, setRoute] = useState(initialRoute);
  const [origin, setOrigin] = useState(initialOrigin);
  const [destination, setDestination] = useState(initialDestination);

  // Full stop objects (with position) for the currently selected route only
  const routeStops = useMemo(() => {
    if (!route) return [];
    return getRouteById(route.id)?.stops || [];
  }, [route]);

  function handleSelectRoute(newRoute) {
    setRoute(newRoute);
    setOrigin(null);
    setDestination(null);
  }

  function handleSelectStop(stop) {
    // Mirror the dropdowns: no route picked yet means the map isn't interactive either
    if (!route) return;

    // Ignore pins that aren't on the selected route
    if (!routeStops.some((s) => s.id === stop.id)) return;

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
              <h1 className="how-it-works__title">1. Plan your route.</h1>
              <p className="how-it-works__description">
                Pick a route, then choose where you're starting from and where you're headed.
              </p>
            </div>

            <RouteSearch
              route={route}
              origin={origin}
              destination={destination}
              stops={routeStops}
              onSelectRoute={handleSelectRoute}
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