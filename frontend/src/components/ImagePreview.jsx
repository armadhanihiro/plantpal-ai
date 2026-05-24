import PlantInfoCard from "./PlantInfoCard";
import HealthScore from './HealthScore'

function ImagePreview({ image, plantData }) {
    if(!image) return null;

    return(
        <>
            <img
                src={image}
                alt="Plant preview"
                className="preview"
            />
            {
                plantData && (
                    <>
                        <HealthScore score={plantData.healthScore}/>

                        <PlantInfoCard
                            plantName={plantData.plantName}
                            watering={plantData.watering}
                            sunlight={plantData.sunlight}
                            difficulty={plantData.difficulty}
                        />
                    </>
                )
            }
        </>
    )
}

export default ImagePreview;