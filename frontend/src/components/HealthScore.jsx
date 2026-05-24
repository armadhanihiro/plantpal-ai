function HealthScore({ score }) {
    return (
        <div className="health-card">
            <h3>Plant Health Score</h3>

            <div className="score">
                {score || 0}%
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