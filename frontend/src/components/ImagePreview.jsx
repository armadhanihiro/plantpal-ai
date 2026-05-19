import PlantInfoCard from "./PlantInfoCard";
import HealthScore from './HealthScore'

function ImagePreview({ image }) {

    if(!image) return null;

    return(
        <>
            <img
                src={image}
                alt="Plant preview"
                className="preview"
            />
            <HealthScore />
            <PlantInfoCard/>
        </>
    )
}

export default ImagePreview;