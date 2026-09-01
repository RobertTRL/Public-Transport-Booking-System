function RouteSearch({
  route,
  origin,
  destination,
  routes = [],
  stops = [],
  onSelectRoute,
  onSelectOrigin,
  onSelectDestination,
  loadingRoutes = false,
  loadingStops = false,
  children, // NEW: optional extra content rendered in the same row (e.g. a CTA button)
}) {
  const routeOptions = routes.length > 0 ? routes : allRoutes;
  const stopOptions = stops.length > 0 ? stops : allStops;

  return (
    <div className="route-search">
      <RouteDropdown
        placeholder="Pick a route"
        options={routeOptions}
        value={route}
        onChange={onSelectRoute}
        disabled={loadingRoutes}
      />

      <LocationDropdown
        placeholder="Pick a starting point"
        options={stopOptions}
        value={origin}
        onChange={(stop) => onSelectOrigin(stop === null ? null : stop)}
        disabled={!route || loadingStops}
      />

      <LocationDropdown
        placeholder="Pick a destination"
        options={stopOptions}
        value={destination}
        onChange={(stop) => onSelectDestination(stop === null ? null : stop)}
        disabled={!route || loadingStops}
      />

      {children}
    </div>
  );
}

export default RouteSearch;