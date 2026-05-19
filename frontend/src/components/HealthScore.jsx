import { useState } from 'react'

function HealthScore() {
    const [score] = useState( () => 
        Math.floor(Math.random()*21)+80
    );
    return (
        <div className="health-card">
            <h3>Plant Health Score</h3>
            <div className="score">
                {score}%
            </div>

            <p className="health-status">
                {
                    score >= 90
                    ? "Excellent 🌿"

                    : score >= 80
                    ? "Healthy 🌱"

                    : "Needs attention ⚠️"
                }
            </p>
        </div>
    );
}

export default HealthScore;