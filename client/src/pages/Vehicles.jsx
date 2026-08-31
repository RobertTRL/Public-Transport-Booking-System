import { useState, useEffect } from 'react';
import AddVehicleModal from "../components/AddVehicleModal";

const Vehicles = ({ apiClient }) => {
  const [vehicles, setVehicles] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoute, setSelectedRoute] = useState('');

  // Pagination State
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Trigger state to handle manual re-fetches (e.g. after add/delete/toggle)
  const [refreshKey, setRefreshKey] = useState(0);

  const triggerRefresh = () => setRefreshKey((prev) => prev + 1);

  // Fetch Routes for dropdown filter
  useEffect(() => {
    let isMounted = true;
    apiClient
      .get('/api/v1/provider/routes')
      .then((res) => {
        if (isMounted) {
          setRoutes(res.data.items || res.data.routes || (Array.isArray(res.data) ? res.data : []));
        }
      })
      .catch((err) => console.error('Failed to load routes filter', err));

    return () => {
      isMounted = false;
    };
  }, [apiClient]);

  // Fetch Vehicles with Pagination & Filters
  useEffect(() => {
    let isMounted = true;
    
    const loadVehicles = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          page,
          per_page: perPage,
        });
        if (searchQuery) params.append('q', searchQuery);
        if (selectedRoute) params.append('route_id', selectedRoute);

        const res = await apiClient.get(`/api/v1/provider/vehicles?${params.toString()}`);
        if (!isMounted) return;

        const data = res.data;
        setVehicles(data.items || data.vehicles || (Array.isArray(data) ? data : []));
        setTotalPages(data.total_pages || data.pages || 1);
        setTotalItems(data.total || (data.items ? data.items.length : 0));
      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.message || 'Failed to fetch vehicles.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadVehicles();

    return () => {
      isMounted = false;
    };
  }, [apiClient, page, perPage, searchQuery, selectedRoute, refreshKey]);

  const handleToggleStatus = async (vehicle) => {
    const newStatus = !vehicle.is_active;
    try {
      await apiClient.patch(`/api/v1/provider/vehicles/${vehicle.id}`, { is_active: newStatus });
      triggerRefresh();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update vehicle status.');
    }
  };

  const handleDeleteVehicle = async (vehicleId) => {
    if (!window.confirm('Are you sure you want to remove this vehicle?')) return;
    try {
      await apiClient.delete(`/api/v1/provider/vehicles/${vehicleId}`);
      triggerRefresh();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete vehicle.');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">SACCO Vehicles</h1>
          <p className="text-sm text-gray-500">Manage fleet vehicles and route assignments</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium"
        >
          + Add Vehicle
        </button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-lg border shadow-sm">
        <input
          type="text"
          placeholder="Search number plate..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setPage(1);
          }}
          className="border rounded px-3 py-2 text-sm w-full sm:w-64"
        />

        <select
          value={selectedRoute}
          onChange={(e) => {
            setSelectedRoute(e.target.value);
            setPage(1);
          }}
          className="border rounded px-3 py-2 text-sm w-full sm:w-48 bg-white"
        >
          <option value="">All Routes</option>
          {routes.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading vehicles...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-600">{error}</div>
        ) : vehicles.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No vehicles found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-gray-50 border-b text-xs text-gray-500 font-semibold uppercase">
                <tr>
                  <th className="p-4">Number Plate</th>
                  <th className="p-4">Capacity</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {vehicles.map((v) => (
                  <tr key={v.id} className="hover:bg-gray-50">
                    <td className="p-4 font-semibold text-gray-800">
                      {v.number_plate || v.plate_number}
                    </td>
                    <td className="p-4">{v.capacity} Seats</td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          v.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {v.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-3">
                      <button
                        onClick={() => handleToggleStatus(v)}
                        className="text-blue-600 hover:underline text-xs"
                      >
                        {v.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleDeleteVehicle(v.id)}
                        className="text-red-600 hover:underline text-xs"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t gap-4 text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <span>Show</span>
            <select
              value={perPage}
              onChange={(e) => {
                setPerPage(Number(e.target.value));
                setPage(1);
              }}
              className="border rounded p-1 text-sm bg-white"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
            <span>entries (Total: {totalItems})</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span>
              Page {page} of {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {showAddModal && (
        <AddVehicleModal
          apiClient={apiClient}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            triggerRefresh();
          }}
        />
      )}
    </div>
  );
};

export default Vehicles;