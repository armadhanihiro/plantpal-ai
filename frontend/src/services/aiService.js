import {GoogleGenerativeAI} from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(
    import.meta.env.VITE_GEMINI_API_KEY
);

const model = genAI.getGenerativeModel({
    model:"gemini-2.5-flash"
});

async function fileToGenerativePart(file){
    const base64EncodedData = await new Promise((resolve, reject)=>{
            const reader = new FileReader();

            reader.onloadend = () => {
                const base64 = reader.result.split(",")[1];
                resolve(base64);
            };

            reader.onerror = reject;

            reader.readAsDataURL(file);
    });

    return {
        inlineData:{
            mimeType:file.type,
            data:base64EncodedData
        }
    };

}

export async function askPlantAI(question, imageFile){

    try{
        
        const prompt =
            `
            You are PlantPal AI, a friendly plant care assistant.

            Your job is to help users understand plant problems and give simple, practical advice.

            If an image is provided, analyze the plant image and include visual observations.
            If no image is provided, answer based only on the user's question.

            Answer style:
            - Be clear and concise.
            - Use short bullet points when helpful.
            - Avoid long paragraphs.
            - Do not give medical or chemical advice.
            - If the question is unclear, ask for more details.
            - Keep the tone friendly and supportive.

            User question:
            ${question}
            `;

        const parts = [
            { text: prompt }
        ];

        if (imageFile) {
            const imagePart = await fileToGenerativePart(imageFile);
            parts.push(imagePart);
        }

        const result = await model.generateContent({
            contents: [
                {
                    role: "user",
                    parts: parts,
                },
            ],
        });
        return result.response.text();
    }catch(error){
        console.error(error);
        return "PlantPal AI encountered an error. Please try again.";
    }

}