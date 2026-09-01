import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchWithAuth, getAccessToken } from "../../utils/auth";
import "../../styles/hero.css";

export default function HeroGeometric({
    title1,
    title2,
    description,
    className = "",
}) {
    const navigate = useNavigate();
    const [authError, setAuthError] = useState("");

    async function handleBookRide() {
        setAuthError("");
        const token = getAccessToken();

        if (!token) {
            navigate("/login", {
                state: { error: "Please sign in to book a ride." },
            });
            return;
        }

        try {
            const response = await fetchWithAuth("/api/v1/me");

            if (response.ok) {
                navigate("/home");
            } else {
                navigate("/login", {
                    state: {
                        error: "Your session expired. Please sign in again.",
                    },
                });
            }
        } catch {
            navigate("/login", {
                state: {
                    error: "Unable to verify your session. Please try again.",
                },
            });
        }
    }

    const handleScrollToDemo = () => {
        document
            .querySelector(".how-it-works-page")
            ?.scrollIntoView({ behavior: "smooth" });
    };

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
                                        transition={{
                                            duration: 1,
                                            ease: [0.16, 1, 0.3, 1],
                                            delay: 0.2,
                                        }}
                                    >
                                        <span className="hero-geometric__title--bold">
                                            {title1}
                                        </span>
                                    </motion.h1>
                                </div>
                            )}

                            {title2 && (
                                <div
                                    className="hero-geometric__title-wrap"
                                    id="title2"
                                >
                                    <motion.h1
                                        className="main-title hero-geometric__title--subtitle"
                                        initial={{ y: "100%", opacity: 0 }}
                                        animate={{ y: "0%", opacity: 1 }}
                                        transition={{
                                            duration: 1,
                                            ease: [0.16, 1, 0.3, 1],
                                            delay: 0.35,
                                        }}
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
                                    transition={{
                                        duration: 0.8,
                                        delay: 0.6,
                                        ease: "easeOut",
                                    }}
                                >
                                    {description}
                                </motion.p>
                            </div>
                        )}

                        {authError && (
                            <motion.p
                                className="hero-geometric__error"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                {authError}
                            </motion.p>
                        )}

                        <motion.div
                            className="hero-geometric__actions"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                                duration: 0.8,
                                delay: 0.75,
                                ease: "easeOut",
                            }}
                        >
                            <button
                                type="button"
                                className="hero-geometric__cta hero-geometric__cta--primary"
                                onClick={handleBookRide}
                            >
                                Book a Ride
                            </button>

                            <button
                                type="button"
                                onClick={handleScrollToDemo}
                                className="hero-geometric__cta hero-geometric__cta--secondary"
                            >
                                Try a Live Demo
                            </button>
                        </motion.div>
                    </div>
                </div>
            )}
        </div>
    );
}

