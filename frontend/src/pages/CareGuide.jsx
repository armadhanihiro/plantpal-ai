import GuideCard from "../components/GuideCard";

function CareGuide() {
    return (
        <div className="guide-page">
            <h1>Plant Care Guide 🌿</h1>
            <p>Simple tips to keep your plants healthy.</p>

            <div className="guide-grid">
                <GuideCard
                    icon="💧"
                    title="Watering Guide"
                    content="Water only when the soil feels dry. Avoid overwatering."
                />
                <GuideCard
                    icon="☀️"
                    title="Sunlight Guide"
                    content="Most indoor plants prefer bright indirect sunlight."
                />
                <GuideCard
                    icon="🍂"
                    title="Common Problems"
                    content="Yellow leaves may indicate overwatering. Brown tips may indicate low humidity."
                />
            </div>
        </div>
    );
}

export default CareGuide;