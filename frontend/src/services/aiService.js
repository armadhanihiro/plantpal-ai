import {GoogleGenerativeAI} from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(
    import.meta.env
    .VITE_GEMINI_API_KEY
);

const model = genAI.getGenerativeModel({
    model:"gemini-2.5-flash"
});

export async function askPlantAI(question){

    try{

        const result = await model.generateContent(
            `
            You are PlantPal AI, a friendly plant care assistant.

            Your job is to help users understand plant problems and give simple, practical advice.

            Answer style:
            - Be clear and concise.
            - Use short bullet points when helpful.
            - Avoid long paragraphs.
            - Do not give medical or chemical advice.
            - If the question is unclear, ask for more details.
            - Keep the tone friendly and supportive.

            User question:
            ${question}
            `
        );

        const response = result.response.text();
        return response;
    }catch(error){
        console.error(error);
        return "PlantPal AI encountered an error.";
    }

}