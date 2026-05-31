import { useEffect, useState } from "react";
import { getJourneyStats, getPlantJourneys } from "../services/journeyService";

function PlantJourney({userId}) {
    const [stats, setStats] = useState({
        totalPlants: 0,
        totalScans: 0,
        averageHealth: 0
    });
    const [journeys, setJourneys] = useState([]);

    useEffect(() => {
        async function loadStats() {
            if (!userId) return;

            const data = await getJourneyStats(userId);
            const journeyData = await getPlantJourneys(userId);

            setStats(data);
            setJourneys(journeyData);
        }

        loadStats();
    }, [userId]);

    return (
        <main className="journey-page">
            <section className="journey-hero">
                <span className="journey-badge">🌱 Plant Journey</span>
                <h1>Track your plant health over time.</h1>
                <p>
                    Every scan you make will become part of your plant’s story,
                    helping you understand progress, patterns, and care needs.
                </p>
            </section>

            <section className="journey-stats-grid">
                <div className="journey-stat-card">
                    <span>Total Plants</span>
                    <strong>{stats.totalPlants}</strong>
                    <p>Plants currently tracked</p>
                </div>

                <div className="journey-stat-card">
                    <span>Total Scans</span>
                    <strong>{stats.totalScans}</strong>
                    <p>Photos analyzed by PlantPal</p>
                </div>

                <div className="journey-stat-card">
                    <span>Average Health</span>
                    <strong>{stats.averageHealth}%</strong>
                    <p>Based on your plant scans</p>
                </div>
            </section>

            {
                journeys.length > 0 && (
                    <section className="journey-list">
                        <h2>Your Plant Journeys</h2>

                        <div className="journey-card-grid">
                            {journeys.map((journey) => (
                                <div className="plant-journey-card" key={journey.id}>
                                    {journey.latestImage ? (
                                        <img
                                            src={journey.latestImage}
                                            alt={journey.title}
                                        />
                                    ) : (
                                        <div className="journey-card-placeholder">
                                            🌱
                                        </div>
                                    )}

                                    <div>
                                        <h3>{journey.title}</h3>

                                        <p>
                                            {journey.scanCount} scans · Avg health {journey.averageHealth}%
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )
            }

            {
                journeys.length === 0 && (
                    <section className="journey-empty-card">
                        <div className="journey-empty-icon">
                            📷
                        </div>

                        <h2>No plant journeys yet</h2>

                        <p>
                            Start your first journey by going back to Chat and uploading
                            your first plant photo.
                        </p>
                    </section>
                )
            }
        </main>
    );
}

export default PlantJourney;