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


export async function askPlantAI(question, imageFile, conversationId, userId){
    try{
        let imageBase64 = null;
        let mimeType = null;

        if(imageFile){
            imageBase64 = await fileToBase64(imageFile);
            mimeType = imageFile.type;
        }

        const response = await fetch(
            `${import.meta.env.VITE_API_URL}/api/analyze`,
            {
                method:"POST",
                headers:{
                    "Content-Type":
                    "application/json"
                },
                body:JSON.stringify({
                    question,
                    imageBase64,
                    mimeType,
                    conversationId,
                    userId
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

export async function getPlantHistory(){
    try{
        const response = await fetch(
            `${import.meta.env.VITE_API_URL}/api/history`
        );
        return await response.json();
    } catch(error){
        console.error(error);
        return [];
    }
}

export async function getConversations(userId) {
    try {
        const response = await fetch(
            `${import.meta.env.VITE_API_URL}/api/conversations?userId=${userId}`
        );

        return await response.json();
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function getMessages(conversationId) {
    try {
        const response = await fetch(
            `${import.meta.env.VITE_API_URL}/api/messages/${conversationId}`
        );

        return await response.json();
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function getConversationPlant(conversationId){
    try{
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/conversation-plant/${conversationId}`);

        if (response.status === 404) {
            return null;
        }
        
        if (!response.ok) {
            return null;
        }
        return await response.json();
    }catch(error){
        console.error(error);
        return null;
    }
}

export async function deleteConversation(conversationId) {
    try {
        const response = await fetch(
            `${import.meta.env.VITE_API_URL}/api/conversations/${conversationId}`,
            {
                method: "DELETE"
            }
        );

        return await response.json();
    } catch (error) {
        console.error(error);
        return null;
    }
}

export async function renameConversation(conversationId, title){
    try{
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/conversations/${conversationId}`,
            {
                method:"PATCH",
                headers:{"Content-Type":"application/json"},
                body:JSON.stringify({title})
            }
        );
        return await response.json();
    }catch(error){
        console.error(error);
        return null;
    }
}