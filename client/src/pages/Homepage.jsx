import { Outlet } from "react-router-dom";
import BookingNavbar from "../components/bookings/BookingNavbar.jsx";
import "../styles/homepage.css";

export default function Homepage() {
    return (
        <div className="booking-homepage">
            <BookingNavbar />
            <header className="booking-homepage__header">
                <span className="booking-homepage__brand">HopOn</span>
            </header>
            <main className="booking-homepage__content">
                <Outlet />
            </main>
        </div>
    );
}