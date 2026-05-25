import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: "10mb" }));

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
});

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

app.get("/", (req, res) => {
    res.send("PlantPal backend is running 🌱");
});

app.post("/api/analyze", async (req, res) => {
    try {
        const { question, imageBase64, mimeType } = req.body;
        const prompt = `
            You are PlantPal AI, a friendly plant care assistant.

            Your job is to help users understand plant problems and give simple, practical advice.

            Analyze the plant image if provided and answer the user's question.

            Answer style:
            - Be clear and concise.
            - Use short bullet points when helpful.
            - Avoid long paragraphs.
            - Do not give medical or chemical advice.
            - If the question is unclear, ask for more details.
            - Keep the tone friendly and supportive.

            Return ONLY valid JSON with this format:
            {
                "answer": "short plant care answer",
                "healthScore": 0-100,
                "plantName": "most likely plant name",
                "watering": "Low/Medium/High",
                "sunlight": "Direct/Indirect/Low Light",
                "difficulty": "Easy/Medium/Hard"
            }

            Rules:
            - If an image is provided, always try to identify the plant.
            - If uncertain, use "Likely ..." instead of "Unknown Plant".
            - Keep the answer clear and concise.

            User question:
            ${question}
            `
        ;

        const parts = [{ text: prompt }];

        if (imageBase64 && mimeType) {
            parts.push({
                inlineData: {
                    data: imageBase64,
                    mimeType,
                },
            });
        }

        const result = await model.generateContent({
            contents: [
                {
                    role: "user",
                    parts,
                },
            ],
        });

        const text = result.response.text();
        const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();
        const parsed = JSON.parse(cleanedText);
        const { data, error } = await supabase.from("plant_scans").insert([
            {
                plant_name: parsed.plantName,
                health_score: parsed.healthScore,
                watering: parsed.watering,
                sunlight: parsed.sunlight,
                difficulty: parsed.difficulty,
                answer: parsed.answer
            }

        ]).select();

        if (error) {
            console.error("Supabase insert error:", error);
        } else {
            console.log("Saved to Supabase:", data);
        }

        res.json(parsed);
    } catch (error) {
            console.error(error);
            res.status(500).json(
                {
                    error: "PlantPal backend failed to analyze the request.",
                }
            );
    }
});

app.listen(PORT, () => {
    console.log(`PlantPal backend running on port ${PORT}`);
});