import { Outlet } from "react-router-dom";
import BookingNavbar from "../components/bookings/BookingNavbar.jsx";
import "../styles/homepage.css";

export default function Homepage() {
    return (
        <div className="booking-homepage">
            <BookingNavbar />
            <main className="booking-homepage__content">
                <Outlet />
            </main>
        </div>
    );
}