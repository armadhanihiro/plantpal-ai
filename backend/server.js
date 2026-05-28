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
        const { question, imageBase64, mimeType, conversationId } = req.body;
        let activeConversationId = conversationId;
        if(!activeConversationId){
            const {data:newConversation, error:conversationError} = await supabase.from("conversations").insert([
                {
                    title : question.length > 40 ? question.slice(0,40) + "..." : question
                }
            ]).select().single();

            if (conversationError) {
                console.error("Conversation insert error:", conversationError);
                return res.status(500).json({
                    error: "Failed to create conversation"
                });
            }
                activeConversationId = newConversation.id;
        }

        await supabase.from("messages").insert([
            {
                conversation_id: activeConversationId,
                role:"user",
                content:question
            }
        ]);

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

        const {data:previousMessages} = await supabase.from("messages").select("*").eq("conversation_id", activeConversationId).order(
            "created_at",
            {
                ascending:true
            }
        );

        const chatHistory =previousMessages.map((msg)=>({
            role:
                msg.role ==="assistant" ? "model" : "user",
            parts:[
                {
                    text:
                    msg.content
                }
            ]
        }));

        const chat = model.startChat({history:chatHistory});
        const messageParts = [
            {
                text:prompt
            }
        ];

        if(imageBase64 && mimeType){
            messageParts.push({
                inlineData:{
                    data:imageBase64,
                    mimeType
                }
            });
        }

        let imageUrl = null;

        if(imageBase64 && mimeType){
            console.log("Has image:", !!imageBase64);
            console.log("Mime type:", mimeType);

            const buffer = Buffer.from(imageBase64, "base64");
            const fileName = `${Date.now()}.png`;
            const { error: uploadError } = await supabase.storage.from("plant-images").upload(fileName,buffer, {contentType: mimeType});

            if(uploadError){
                console.error("Image upload error:", uploadError);
            } else {
                const { data: urlData } = supabase.storage.from("plant-images").getPublicUrl(fileName);
                imageUrl = urlData.publicUrl;
                console.log("Image URL:", imageUrl);
            }
        }

        let text = "";
        try{
            const result = await chat.sendMessage(messageParts);
            text = result.response.text();

        } catch(aiError){
            console.error(
                "Gemini Error:",
                aiError
            );
            return res.status(500).json({
                answer: "PlantPal AI is currently busy 🌱 Please try again in a moment.",
                healthScore:0,
                plantName: "Unknown Plant",
                watering: "Unknown",
                sunlight: "Unknown",
                difficulty: "Unknown"
            });
        }

        console.log("RAW GEMINI RESPONSE:", text);

        const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();
        
        let parsed;

        try {
            parsed = JSON.parse(cleanedText);
        } catch (parseError) {
            console.error("JSON parse error:", parseError);
            console.error("Raw text:", text);

            parsed = {
                answer: text,
                healthScore: 0,
                plantName: "Unknown Plant",
                watering: "Unknown",
                sunlight: "Unknown",
                difficulty: "Unknown"
            };
        }
        const { data, error } = await supabase.from("plant_scans").insert([
            {
                conversation_id: activeConversationId,
                plant_name: parsed.plantName,
                health_score: parsed.healthScore,
                watering: parsed.watering,
                sunlight: parsed.sunlight,
                difficulty: parsed.difficulty,
                answer: parsed.answer,
                image_url: imageUrl
            }
        ]).select();

        if (error) {
            console.error("Supabase insert error:", error);
        } else {
            console.log("Saved to Supabase:", data);
        }

        res.json({...parsed, imageUrl, conversationId:activeConversationId});
    } catch (error) {
            console.error(error);
            res.status(500).json(
                {
                    error: "PlantPal backend failed to analyze the request.",
                }
            );
    }
});

app.get("/api/history", async(req,res)=>{
        try{
            const { data,error } = await supabase.from("plant_scans").select("*").order(
                "created_at",
                {
                    ascending:false
                }
            ).limit(10);

            if(error){
                console.error(error);
                return res.status(500).json({
                    error:error.message
                });
            }
            res.json(data);
        }catch(error){
            console.error(error);
            res.status(500).json({
                error: "Failed to fetch history"
            });
        }
    }
);

app.get("/api/conversations", async (req, res) => {
    try {
        const { data, error } = await supabase.from("conversations").select("*").order("created_at", { ascending: false });
        if (error) {
            return res.status(500).json({
                error: error.message,
            });
        }
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Failed to fetch conversations",
        });
    }
});

app.get("/api/messages/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase.from("messages").select("*").eq("conversation_id", id).order("created_at", { ascending: true });
        if (error) {
            return res.status(500).json({
                error: error.message,
            });
        }
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Failed to fetch messages",
        });
    }
});

app.get("/api/conversation-plant/:id", async(req,res)=>{
    try{
        const { id } = req.params;
        const {data, error} = await supabase.from("plant_scans").select("*").eq("conversation_id", id).order(
            "created_at",
            {
                ascending:false
            }
        ).limit(1).single();

        if(error){
            return res.status(404).json(null);
        }
        res.json(data);
    }catch(error){
        console.error(error);
        res.status(500).json({
            error:"Failed to fetch plant data"
        });
    }
});

app.delete("/api/conversations/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = await supabase.from("conversations").delete().eq("id", id);

        if (error) {
            return res.status(500).json({error: error.message});
        }

        res.json({
            message: "Conversation deleted successfully"
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to delete conversation"
        });
    }
});

app.patch("/api/conversations/:id", async(req,res)=>{
    try{
        const { id } = req.params;
        const { title } = req.body;
        const { error } = await supabase.from("conversations").update({title}).eq("id", id);

        if(error){
            return res.status(500).json({
                error:error.message
            });
        }

        res.json({
            message:"Conversation renamed"
        });
    }catch(error){
        console.error(error);
        res.status(500).json({error:"Failed to rename conversation"});
    }
});

app.listen(PORT, () => {
    console.log(`PlantPal backend running on port ${PORT}`);
});