import { useState, useEffect } from 'react';
import AddStopModal from "../components/AddStopModal";

const Stops = ({ apiClient }) => {
  const [stops, setStops] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStop, setEditingStop] = useState(null);
  
  // Trigger state for manual updates
  const [refreshKey, setRefreshKey] = useState(0);

  const triggerRefresh = () => setRefreshKey((prev) => prev + 1);

  useEffect(() => {
    let isMounted = true;

    const loadStops = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await apiClient.get('/api/v1/provider/stops');
        if (!isMounted) return;
        const data = res.data;
        setStops(Array.isArray(data) ? data : data.items || data.stops || []);
      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.message || 'Failed to fetch stops.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadStops();

    return () => {
      isMounted = false;
    };
  }, [apiClient, refreshKey]);

  const handleDeleteStop = async (stopId) => {
    if (!window.confirm('Are you sure you want to remove this stop?')) return;
    try {
      await apiClient.delete(`/api/v1/provider/stops/${stopId}`);
      triggerRefresh();
    } catch (err) {
      alert(err.response?.data?.message || 'Cannot remove stop: It may be attached to existing routes.');
    }
  };

  const handleUpdateStop = async (e) => {
    e.preventDefault();
    if (!editingStop) return;

    try {
      await apiClient.patch(`/api/v1/provider/stops/${editingStop.id}`, {
        name: editingStop.name,
        latitude: Number(editingStop.latitude),
        longitude: Number(editingStop.longitude),
      });
      setEditingStop(null);
      triggerRefresh();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update stop.');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Bus Stops & Stages</h1>
          <p className="text-sm text-gray-500">Manage route waypoints and geo-coordinates</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium"
        >
          + Add Stop
        </button>
      </div>

      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading stops...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-600">{error}</div>
        ) : stops.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No stops created yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-gray-50 border-b text-xs text-gray-500 font-semibold uppercase">
                <tr>
                  <th className="p-4">Stop Name</th>
                  <th className="p-4">Latitude</th>
                  <th className="p-4">Longitude</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {stops.map((st) => (
                  <tr key={st.id} className="hover:bg-gray-50">
                    <td className="p-4 font-semibold text-gray-800">{st.name}</td>
                    <td className="p-4 text-gray-600">{st.latitude}</td>
                    <td className="p-4 text-gray-600">{st.longitude}</td>
                    <td className="p-4 text-right space-x-3">
                      <button
                        onClick={() => setEditingStop(st)}
                        className="text-blue-600 hover:underline text-xs"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteStop(st.id)}
                        className="text-red-600 hover:underline text-xs"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showAddModal && (
        <AddStopModal
          apiClient={apiClient}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            triggerRefresh();
          }}
        />
      )}

      {/* Edit Stop Modal */}
      {editingStop && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-lg">
            <h2 className="text-lg font-bold mb-4">Edit Stop Details</h2>
            <form onSubmit={handleUpdateStop} className="space-y-4 text-sm">
              <div>
                <label className="block text-gray-700 font-medium mb-1">Stop Name</label>
                <input
                  type="text"
                  required
                  value={editingStop.name}
                  onChange={(e) => setEditingStop({ ...editingStop, name: e.target.value })}
                  className="w-full border rounded p-2"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">Latitude</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={editingStop.latitude}
                  onChange={(e) => setEditingStop({ ...editingStop, latitude: e.target.value })}
                  className="w-full border rounded p-2"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">Longitude</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={editingStop.longitude}
                  onChange={(e) => setEditingStop({ ...editingStop, longitude: e.target.value })}
                  className="w-full border rounded p-2"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setEditingStop(null)}
                  className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Update Stop
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Stops;