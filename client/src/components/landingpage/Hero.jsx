import { motion } from "framer-motion";
import "../../styles/hero.css";
import { NavLink } from "react-router-dom"

export default function HeroGeometric({
    title1,
    title2,
    description,
    className = "",
}) {
    return (
        <div className={`hero-geometric ${className}`}>
            {(title1 || title2 || description) && (
                <div className="hero-geometric__content">
                    <div className="hero-geometric__inner">
                        <div className="hero-geometric__headline">
                            {title1 && (
                                <div className="hero-geometric__title-wrap">
                                    <motion.h1
                                        className="main-title"
                                        initial={{ y: "100%", opacity: 0 }}
                                        animate={{ y: "0%", opacity: 1 }}
                                        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                                    >
                                        <span className="hero-geometric__title--bold">{title1}</span>
                                    </motion.h1>
                                </div>
                            )}
                            {title2 && (
                                <div className="hero-geometric__title-wrap" id="title2">
                                    <motion.h1
                                        className="main-title hero-geometric__title--subtitle"
                                        initial={{ y: "100%", opacity: 0 }}
                                        animate={{ y: "0%", opacity: 1 }}
                                        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.35 }}
                                    >
                                        {title2}
                                    </motion.h1>
                                </div>
                            )}
                        </div>

                        {description && (
                            <div className="hero-geometric__description-wrap">
                                <motion.p
                                    className="hero-geometric__description"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
                                >
                                    {description}
                                </motion.p>
                            </div>
                        )}

                        <motion.div
                            className="hero-geometric__actions"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.75, ease: "easeOut" }}
                        >
                            <NavLink to="/bookings" className="hero-geometric__cta hero-geometric__cta--primary">
                                Book a Ride
                            </NavLink>
                            <NavLink to="/login" className="hero-geometric__cta hero-geometric__cta--secondary">
                                Login to Dashboard
                            </NavLink>
                        </motion.div>
                    </div>
                </div>
            )}
        </div>
    );
}