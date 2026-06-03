import { useEffect,useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getJourneyDetail } from "../services/journeyService";

function JourneyDetail(){
    const { id } = useParams();
    const [scans,setScans] = useState([]);
    const chartData = scans.slice().reverse().map((scan) => ({
        date: new Date(scan.created_at).toLocaleDateString(),
        health: scan.health_score
    }));

    useEffect(()=>{
        async function loadJourney(){
            const data = await getJourneyDetail(id);
            setScans(data);
        }
        loadJourney();
    },[id]);


    return(
        <main className="journey-detail-page">
            <Link to="/journey" className="back-link">
                ← Back to Journey
            </Link>

            <section className="journey-detail-hero">
                <h1>{scans[0]?.plant_name} 🌱</h1>
                <p>Follow your plant's health journey over time.</p>
            </section>

            {
                chartData.length > 1 && (
                    <section className="health-chart-card">
                        <h2>Health Progress 📈</h2>

                        <div className="simple-health-chart">
                            {
                                chartData.map((item, index) => (
                                    <div className="health-chart-point" key={index}>
                                        <div className="health-bar-wrap">
                                            <div className="health-bar" style={{ height: `${item.health}%` }}></div>
                                        </div>

                                        <div className="health-chart-label">
                                            <strong>{item.health}%</strong>
                                            <small>{item.date}</small>
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                    </section>
                )
            }

            <div className="timeline">
                {scans.map(scan=>(
                    <div className="timeline-item" key={scan.id}>
                        <div className="timeline-dot"></div>

                        <div className="timeline-card">
                            <span className="timeline-date">
                                {new Date(scan.created_at).toLocaleDateString()}
                            </span>

                            <img
                                src={scan.image_url}
                                alt={scan.plant_name}
                            />

                            <h3>Health Score</h3>
                            <strong className="timeline-health">{scan.health_score}%</strong>

                            <div className="timeline-info">
                                <p>💧 {scan.watering}</p>
                                <p>☀️ {scan.sunlight}</p>
                                <p>🌱 {scan.difficulty}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </main>
    )
}

export default JourneyDetail;