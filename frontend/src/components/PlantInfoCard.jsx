function PlantInfoCard({plantName, watering, sunlight, difficulty}) {
    return (
        <div className="plant-card">
            <h3>🌿 Plant Information</h3>

            <div className="info-row">
                <span>Name</span>

                <span>
                    {plantName || "Unknown Plant"}
                </span>
            </div>

            <div className="info-row">
                <span>Watering</span>

                <span>
                    {watering || "Medium"}
                </span>
            </div>

            <div className="info-row">
                <span>Sunlight</span>

                <span>
                    {sunlight || "Indirect"}
                </span>
            </div>

            <div className="info-row">
                <span>Difficulty</span>

                <span>
                    {difficulty || "Easy"}
                </span>
            </div>

        </div>
    );
}

export default PlantInfoCard;