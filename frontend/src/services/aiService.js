async function fileToBase64(file) {
    return new Promise((resolve,reject)=>{
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const base64 = reader.result.split(",")[1];
            resolve(base64);
        };
        reader.onerror = error => reject(error);
    });
}


export async function askPlantAI(question, imageFile){
    try{
        let imageBase64 = null;
        let mimeType = null;

        if(imageFile){
            imageBase64 = await fileToBase64(imageFile);
            mimeType = imageFile.type;
        }

        const response = await fetch(
            "http://localhost:5000/api/analyze",
            {
                method:"POST",
                headers:{
                    "Content-Type":
                    "application/json"
                },
                body:JSON.stringify({
                    question,
                    imageBase64,
                    mimeType
                })
            }
        );

        const data = await response.json();
        return data;
    }catch(error){
        console.error(error);
        return {
            answer: "PlantPal AI encountered an error.",
            healthScore:0,
            plantName:"Unknown Plant",
            watering:"Unknown",
            sunlight:"Unknown",
            difficulty:"Unknown"
        };
    }
}