function PlantInfoCard() {
    return (
        <div className="plant-card">

            <h3>🌿 Plant Information</h3>

            <div className="info-row">
                <span>Name</span>
                <span>Unknown Plant</span>
            </div>

            <div className="info-row">
                <span>Watering</span>
                <span>💧💧 Medium</span>
            </div>

            <div className="info-row">
                <span>Sunlight</span>
                <span>☀️ Indirect</span>
            </div>

            <div className="info-row">
                <span>Difficulty</span>
                <span>Easy</span>
            </div>

        </div>
    );
}

export default PlantInfoCard;