import { useCallback, useEffect, useState } from "react";
import { Plus, Search, Pencil, Trash2, Power } from "lucide-react";
import AddVehicleModal from "./AddVehicleModal";
import {
  listVehicles,
  updateVehicle,
  deleteVehicle,
  listRoutes,
} from "../../api/providerClient";
import "../../styles/Vehicle.css";

const PER_PAGE = 10;

function Vehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);

  const [searchTerm, setSearchTerm] = useState("");
  const [routeFilter, setRouteFilter] = useState("");
  const [routeOptions, setRouteOptions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ number_plate: "", capacity: "" });
  const [rowBusyId, setRowBusyId] = useState(null);

  useEffect(() => {
    listRoutes({ per_page: 50 })
      .then((data) => setRouteOptions(data.items || []))
      .catch(() => setRouteOptions([]));
  }, []);

  const loadVehicles = useCallback(() => {
    setLoading(true);
    setError("");

    return listVehicles({
      page,
      per_page: PER_PAGE,
      q: searchTerm || undefined,
      route_id: routeFilter || undefined,
    })
      .then((data) => {
        setVehicles(data.items || []);
        setTotal(data.total || 0);
        setTotalPages(data.total_pages || 1);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [page, searchTerm, routeFilter]);

  useEffect(() => {
    const timeoutId = setTimeout(loadVehicles, 300);
    return () => clearTimeout(timeoutId);
  }, [loadVehicles]);

  const handleAddVehicle = () => {
    loadVehicles();
  };

  const startEdit = (vehicle) => {
    setEditingId(vehicle.id);
    setEditForm({ number_plate: vehicle.number_plate, capacity: vehicle.capacity });
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = async (vehicleId) => {
    setRowBusyId(vehicleId);
    try {
      const updated = await updateVehicle(vehicleId, {
        number_plate: editForm.number_plate,
        capacity: Number(editForm.capacity),
      });
      setVehicles((list) =>
        list.map((vehicle) => (vehicle.id === vehicleId ? updated : vehicle))
      );
      setEditingId(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setRowBusyId(null);
    }
  };

  const toggleActive = async (vehicle) => {
    setRowBusyId(vehicle.id);
    try {
      const updated = await updateVehicle(vehicle.id, {
        is_active: !vehicle.is_active,
      });
      setVehicles((list) =>
        list.map((item) => (item.id === vehicle.id ? updated : item))
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setRowBusyId(null);
    }
  };

  const removeVehicle = async (vehicle) => {
    if (!window.confirm(`Delete vehicle ${vehicle.number_plate}?`)) return;
    setRowBusyId(vehicle.id);
    try {
      await deleteVehicle(vehicle.id);
      loadVehicles();
    } catch (err) {
      setError(err.message);
      setRowBusyId(null);
    }
  };

  return (
    <>
      <div className="dashboard-header vehicles-header">
        <div>
          <h1>Vehicles</h1>
          <p>View and manage service provider vehicles.</p>
        </div>

        <button
          type="button"
          className="add-vehicle-button"
          onClick={() => setModalOpen(true)}
        >
          <Plus size={16} />
          Add Vehicle
        </button>
      </div>

      <section className="dashboard-content vehicles-summary">
        <div className="dashboard-card">
          <h2>Total Vehicles</h2>
          <p>{total}</p>
        </div>

        <div className="dashboard-card">
          <h2>Page</h2>
          <p>{page} of {totalPages}</p>
        </div>
      </section>

      {error && <p className="vehicle-table-error">{error}</p>}

      <section className="vehicles-panel">
        <div className="vehicles-toolbar">
          <div className="vehicle-search">
            <Search size={16} className="vehicle-search-icon" />

            <input
              type="text"
              placeholder="Search by number plate"
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value);
                setPage(1);
              }}
            />
          </div>

          <select
            value={routeFilter}
            onChange={(event) => {
              setRouteFilter(event.target.value);
              setPage(1);
            }}
          >
            <option value="">All routes</option>
            {routeOptions.map((route) => (
              <option key={route.id} value={route.id}>
                {route.name}
              </option>
            ))}
          </select>
        </div>

        <div className="vehicle-table-container">
          <table className="vehicle-table">
            <thead>
              <tr>
                <th>Number Plate</th>
                <th>Capacity</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" className="vehicle-table-empty">
                    Loading vehicles...
                  </td>
                </tr>
              ) : vehicles.length > 0 ? (
                vehicles.map((vehicle) => {
                  const isEditing = editingId === vehicle.id;
                  const isBusy = rowBusyId === vehicle.id;

                  return (
                    <tr key={vehicle.id}>
                      <td>
                        {isEditing ? (
                          <input
                            value={editForm.number_plate}
                            onChange={(event) =>
                              setEditForm((form) => ({
                                ...form,
                                number_plate: event.target.value,
                              }))
                            }
                          />
                        ) : (
                          vehicle.number_plate
                        )}
                      </td>
                      <td>
                        {isEditing ? (
                          <input
                            type="number"
                            min="1"
                            value={editForm.capacity}
                            onChange={(event) =>
                              setEditForm((form) => ({
                                ...form,
                                capacity: event.target.value,
                              }))
                            }
                          />
                        ) : (
                          vehicle.capacity
                        )}
                      </td>
                      <td>
                        <span
                          className={`availability-badge availability-${
                            vehicle.is_active ? "available" : "unavailable"
                          }`}
                        >
                          {vehicle.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="vehicle-row-actions">
                        {isEditing ? (
                          <>
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => saveEdit(vehicle.id)}
                            >
                              Save
                            </button>
                            <button type="button" onClick={cancelEdit}>
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              title="Edit"
                              disabled={isBusy}
                              onClick={() => startEdit(vehicle)}
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              type="button"
                              title={vehicle.is_active ? "Deactivate" : "Activate"}
                              disabled={isBusy}
                              onClick={() => toggleActive(vehicle)}
                            >
                              <Power size={14} />
                            </button>
                            <button
                              type="button"
                              title="Delete"
                              disabled={isBusy}
                              onClick={() => removeVehicle(vehicle)}
                            >
                              <Trash2 size={14} />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="4" className="vehicle-table-empty">
                    No vehicles found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="vehicle-pagination">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((current) => current - 1)}
          >
            Previous
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((current) => current + 1)}
          >
            Next
          </button>
        </div>
      </section>

      {modalOpen && (
        <AddVehicleModal
          onClose={() => setModalOpen(false)}
          onCreated={handleAddVehicle}
        />
      )}
    </>
  );
}

export default Vehicles;
