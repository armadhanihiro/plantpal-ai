import ImagePreview from "./ImagePreview";

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
                    <div className="plant-panel-empty">
                        <p>No plant image yet.</p>
                        <span>Upload a photo to start your plant analysis.</span>
                    </div>
                )
            }
        </aside>
    );
}

export default PlantPanel;