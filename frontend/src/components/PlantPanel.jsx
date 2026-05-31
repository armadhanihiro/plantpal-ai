import ImagePreview from "./ImagePreview";
import JourneyStarter from "./JourneyStarter";

function PlantPanel({ image, plantData }) {
    return (
        <aside className="plant-panel">
            <div className="plant-panel-header">
                <h3>Plant Overview</h3>
                <p>Your latest plant scan and care summary.</p>
            </div>

            {
                image ? (
                    <ImagePreview image={image} plantData={plantData}/>
                ) : (
                    <JourneyStarter />
                )
            }
        </aside>
    );
}

export default PlantPanel;