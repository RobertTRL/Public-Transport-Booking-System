const StatCard = ({
  title,
  value,
  icon,
  change,
  changeType = "positive",
}) => {
  return (
    <div className="stat-card">
      <div className="stat-card-top">
        <div className="stat-card-icon">
          {icon}
        </div>

        {change && (
          <span className={`stat-change ${changeType}`}>
            {change}
          </span>
        )}
      </div>

      <div className="stat-card-content">
        <p>{title}</p>
        <h2>{value}</h2>
      </div>
    </div>
  );
};

export default StatCard;