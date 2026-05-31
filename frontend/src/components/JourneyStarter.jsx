function JourneyStarter() {
    return (
        <div className="journey-starter">
            <div className="journey-icon">
                🌱
            </div>

            <h3>Start Your Plant Journey</h3>

            <p>
                Upload your first plant photo to begin tracking its health and care progress.
            </p>

            <ul>
                <li>Identify plant species</li>
                <li>Get AI care recommendations</li>
                <li>Track health over time</li>
                <li>Build your plant history</li>
            </ul>

            <button
                className="journey-upload-btn"
                onClick={() =>
                    document.getElementById("plant-upload")?.click()
                }
            >
                📷 Upload Plant
            </button>
        </div>
    );
}

export default JourneyStarter;