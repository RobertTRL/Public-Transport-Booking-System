import { Link } from 'react-router-dom';

const RouteCard = ({ route }) => {
  const { id, name, color_code, color, description, assigned_vehicles_count, total_vehicles } = route;

  const badgeColor = color_code || color || '#3B82F6';
  const vehicleCount = assigned_vehicles_count ?? total_vehicles ?? 0;

  return (
    <div className="bg-white rounded-lg border shadow-sm p-5 hover:shadow-md transition-shadow flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-gray-800">{name}</h3>
          <span
            className="px-2.5 py-1 text-xs font-semibold rounded-full text-white"
            style={{ backgroundColor: badgeColor }}
          >
            Route #{id}
          </span>
        </div>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {description || 'No description provided.'}
        </p>
      </div>

      <div className="pt-4 border-t flex items-center justify-between text-sm">
        <span className="text-gray-500 font-medium">
          🚍 {vehicleCount} {vehicleCount === 1 ? 'Vehicle' : 'Vehicles'}
        </span>
        <Link
          to={`/dashboard/routes/${id}`}
          className="text-blue-600 hover:text-blue-800 font-semibold text-xs uppercase tracking-wider"
        >
          View Details →
        </Link>
      </div>
    </div>
  );
};

export default RouteCard;
