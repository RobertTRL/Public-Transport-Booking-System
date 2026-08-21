import Sidebar from "../components/Sidebar";
import "../styles/dashboard.css";
import BookingNavbar from "../components/BookingNavbar"

function Bookings() {
  return (
    // <div className="dashboard">
    //   <Sidebar />

    //   <main className="dashboard-main">
    //     <div className="dashboard-header">
    //       <div>
    //         <h1>My Bookings</h1>
    //         <p>View and manage your transport bookings.</p>
    //       </div>
    //     </div>

    //     <section className="dashboard-content">
    //       <div className="dashboard-card">
    //         <h2>Upcoming Bookings</h2>
    //         <p>0</p>
    //       </div>

    //       <div className="dashboard-card">
    //         <h2>Completed Bookings</h2>
    //         <p>0</p>
    //       </div>

    //       <div className="dashboard-card">
    //         <h2>Cancelled Bookings</h2>
    //         <p>0</p>
    //       </div>
    //     </section>

    //     <section className="dashboard-map">
    //       <h2>Booking History</h2>

    //       <div className="map-placeholder">
    //         <p>No bookings available yet.</p>
    //       </div>
    //     </section>
    //   </main>
    // </div>
    <div className="booking-layout">
      <BookingNavbar />
      <main className="booking-main">
        <Outlet />
      </main>
      
    </div>
  );
}

export default Bookings;