import { useState, useEffect } from 'react';
import RouteCard from '../components/RouteCard';

const Routes = ({ apiClient }) => {
  const [routes, setRoutes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [colorFilter, setColorFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let ignore = false;

    async function loadRoutes() {
      setError(null);
      try {
        const params = {
          ...(searchQuery && { q: searchQuery }),
          ...(colorFilter && { color: colorFilter }),
        };

        const response = await apiClient.get('/api/v1/provider/routes', { params });
        const data = response.data;
        if (!ignore) {
          setRoutes(Array.isArray(data) ? data : data.routes || data.items || []);
        }
      } catch (err) {
        if (!ignore) {
          setError(err.response?.data?.message || 'Failed to fetch routes.');
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadRoutes();

    return () => {
      ignore = true;
    };
  }, [apiClient, searchQuery, colorFilter]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Routes Management</h1>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-lg shadow-sm border">
        <input
          type="text"
          placeholder="Search routes..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setIsLoading(true);
          }}
          className="flex-1 rounded-md border border-gray-300 p-2 text-sm focus:outline-none focus:border-blue-500"
        />
        <input
          type="text"
          placeholder="Filter by color badge..."
          value={colorFilter}
          onChange={(e) => {
            setColorFilter(e.target.value);
            setIsLoading(true);
          }}
          className="w-full sm:w-48 rounded-md border border-gray-300 p-2 text-sm focus:outline-none focus:border-blue-500"
        />
      </div>

      {isLoading ? (
        <div className="p-8 text-center text-gray-500">Loading routes...</div>
      ) : error ? (
        <div className="p-8 text-center text-red-600">{error}</div>
      ) : routes.length === 0 ? (
        <div className="p-8 text-center text-gray-500 bg-white rounded-lg border">
          No routes available.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {routes.map((route) => (
            <RouteCard key={route.id} route={route} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Routes;