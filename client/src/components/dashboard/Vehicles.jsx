function Vehicles() {
  return (
    <>
      <div className="dashboard-header">
        <h1>Vehicles</h1>
        <p>View and manage service provider vehicles.</p>
      </div>

      <section className="dashboard-content">
        <div className="dashboard-card">
          <h2>Total Vehicles</h2>
          <p>0</p>
        </div>

        <div className="dashboard-card">
          <h2>Available Vehicles</h2>
          <p>0</p>
        </div>
      </section>
    </>
  );
}

export default Vehicles;