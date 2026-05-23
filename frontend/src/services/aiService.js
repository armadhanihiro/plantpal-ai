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

        const result = await model.generateContent(`
            You are PlantPal AI, a helpful plant care assistant.

            Answer the user's plant question clearly and briefly.

            Formatting rules:
            - Use short bullet points.
            - Do not add blank lines between bullet points.
            - Keep the explanation on the same line after the bold label.
            - Format bullets like this:
            - **Cause:** explanation

            Question:
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