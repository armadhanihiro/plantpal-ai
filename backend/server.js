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

async function generateWithRetry(model, messageParts, retries = 3) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            return await model.generateContent(messageParts);
        } catch (error) {
            const isTemporaryError = error.status === 503 || error.status === 429;
            if (!isTemporaryError || attempt === retries) {
                throw error;
            }
            await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
        }
    }
}

app.get("/", (req, res) => {
    res.send("PlantPal backend is running 🌱");
});

app.post("/api/analyze", async (req, res) => {
    let activeConversationId = null;
    let createdNewConversation = false;
    try {
        const { question, imageBase64, mimeType, conversationId, userId } = req.body;

        activeConversationId = conversationId

        if(!activeConversationId){
            const {data:newConversation, error:conversationError} = await supabase.from("conversations").insert([
                {
                    title : question.length > 40 ? question.slice(0,40) + "..." : question,
                    user_id: userId
                }
            ]).select().single();

            if (conversationError) {
                console.error("Conversation insert error:", conversationError);
                return res.status(500).json({
                    error: "Failed to create conversation"
                });
            }
                activeConversationId = newConversation.id;
                createdNewConversation = true;
        }

        let currentPlantName = null;
        if (activeConversationId) {
            const { data: latestPlant } = await supabase.from("plant_scans").select("plant_name")
                .eq("conversation_id", activeConversationId).order("created_at", { ascending: false }).limit(1).single();

            currentPlantName = latestPlant?.plant_name || null;
        }

        const prompt = `
            You are PlantPal AI, a friendly plant care assistant.

            Your job is to help users understand plant problems and give simple, practical advice.

            Analyze the plant image if provided and answer the user's question.

            First, determine whether the uploaded image contains a real plant.

            Return ONLY valid JSON with this exact format:

            {
                "isPlant": true,
                "isSamePlant": true,
                "answer": "short plant care answer",
                "healthScore": 95,
                "plantName": "most likely plant name",
                "watering": "Low/Medium/High",
                "sunlight": "Direct/Indirect/Low Light",
                "difficulty": "Easy/Medium/Hard"
            }

            If the uploaded image does NOT contain a plant, return ONLY this format:

            {
                "isPlant": false,
                "isSamePlant": null,
                "answer": "I couldn't detect a plant in this image. Please upload a clear photo of a plant so I can help you.",
                "healthScore": null,
                "plantName": null,
                "watering": null,
                "sunlight": null,
                "difficulty": null
            }

            Current journey plant:
            ${currentPlantName || "No plant has been identified in this journey yet."}

            Rules for isSamePlant:
            - If Current journey plant is empty, set isSamePlant to true.
            - If the uploaded image appears to be the same plant species as the current journey plant, set isSamePlant to true.
            - If the uploaded image appears to be a different plant species, set isSamePlant to false.
            - If unsure, set isSamePlant to true to avoid interrupting the user.

            Rules:
            - If the image does not contain a plant, do not guess a plant.
            - If the image contains objects, animals, people, food, or anything unrelated to plants, set isPlant to false.
            - If an image is provided and contains a plant, always try to identify the plant.
            - If uncertain about the plant species, use "Likely ..." instead of "Unknown Plant".

            - healthScore must represent estimated plant health from 0 to 100.
            - A healthy looking plant should usually have healthScore between 80 and 100.
            - A plant with minor problems should usually have healthScore between 50 and 79.
            - A dying or severely damaged plant should usually have healthScore below 50.
            - Return healthScore only as a number.
            - Never return percentage symbols, text, fractions, or 1-10 scale.

            - Be clear and concise.
            - Use short bullet points when helpful.
            - Avoid long paragraphs.
            - Do not give medical or chemical advice.
            - Keep the tone friendly and supportive.

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
            const buffer = Buffer.from(imageBase64, "base64");
            const fileName = `${Date.now()}.png`;
            const { error: uploadError } = await supabase.storage.from("plant-images").upload(fileName,buffer, {contentType: mimeType});

            if(uploadError){
                console.error("Image upload error:", uploadError);
            } else {
                const { data: urlData } = supabase.storage.from("plant-images").getPublicUrl(fileName);
                imageUrl = urlData.publicUrl;
            }
        }

        let text = "";
        try{
            const result = await generateWithRetry(model, messageParts);
            text = result.response.text();

            const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();

        } catch(aiError){
            console.error(
                "Gemini Error:",
                aiError
            );

            await supabase.from("messages").insert([
                {
                    conversation_id: activeConversationId,
                    role: "assistant",
                    content: "Sorry, PlantPal AI is currently busy. Please try again later."
                }
            ]);
            return res.status(500).json({
                answer: "PlantPal AI is currently busy 🌱 Please try again in a moment.",
                isError: true,
                isPlant: false,
                healthScore: null,
                plantName: null,
                watering: null,
                sunlight: null,
                difficulty: null,
                imageUrl: null,
                conversationId: activeConversationId
            });
        }

        function normalizeHealthScore(value) {
            if (value === null || value === undefined) return null;

            if (typeof value === "number") {
                if (value <= 10) return Math.round(value * 10);
                return Math.min(100, Math.max(0, Math.round(value)));
            }

            if (typeof value === "string") {
                const match = value.match(/\d+/);
                if (!match) return null;

                const number = Number(match[0]);

                if (number <= 10) return number * 10;

                return Math.min(100, Math.max(0, number));
            }

            return null;
        }

        const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();
        
        let parsed;

        try {
            parsed = JSON.parse(cleanedText);
            parsed.healthScore = normalizeHealthScore(parsed.healthScore);
        } catch (parseError) {
            console.error("JSON parse error:", parseError);
            console.error("Raw text:", text);

            parsed = {
                isError: true,
                isPlant: false,
                answer: "PlantPal AI had trouble understanding the response. Please try again.",
                healthScore: null,
                plantName: null,
                watering: null,
                sunlight: null,
                difficulty: null
            };

            if (parsed.isError) {
                await supabase.from("messages").insert([
                    {
                        conversation_id: activeConversationId,
                        role: "assistant",
                        content: parsed.answer
                    }
                ]);

                return res.status(500).json({
                    ...parsed,
                    imageUrl: null,
                    conversationId: activeConversationId
                });
            }
        }
        

        if (!parsed.isPlant) {
            await supabase.from("messages").insert([
                {
                    conversation_id: activeConversationId,
                    role:"assistant",
                    content:parsed.answer
                }
            ]);

            return res.json({
                answer: parsed.answer,
                isPlant:false,
                healthScore:null,
                plantName:null,
                watering:null,
                sunlight:null,
                difficulty:null,
                conversationId: activeConversationId
            });
        }

        if (activeConversationId && currentPlantName && parsed.isSamePlant === false) {
            const warningMessage = `This looks like a different plant from your current ${currentPlantName} journey.`;

            return res.json({
                ...parsed,
                answer: warningMessage,
                isDifferentPlant: true,
                currentPlantName,
                imageUrl: null,
                conversationId: activeConversationId
            });
        }

        await supabase.from("messages").insert([
            {
                conversation_id: activeConversationId,
                role:"user",
                content:question,
                image_url:imageUrl
            }
        ]);

        await supabase.from("messages").insert([
            {
                conversation_id: activeConversationId,
                role: "assistant",
                content: parsed.answer
            }
        ]);

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

        await supabase.from("conversations").update({
            title: parsed.plantName?.slice(0, 35)
        }).eq("id", activeConversationId);

        res.json({...parsed, imageUrl, conversationId:activeConversationId});
    } catch (error) {
            console.error(error);
            if (createdNewConversation && activeConversationId) {
                await supabase.from("conversations").delete().eq("id", activeConversationId);
            }

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
        const { userId } = req.query;

        const { data, error } = await supabase
            .from("conversations")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false });
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
        ).limit(1).maybeSingle();

        // database/query error
        if (error) {
            console.error(
                "Conversation plant error:",
                error
            );

            return res.status(500).json({
                error: error.message
            });
        }

        // conversation exists but no plant scan yet
        if (!data) {
            return res.json(null);
        }

        // latest plant scan
        return res.json(data);
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

app.get("/api/journey/stats", async (req, res) => {
    const { userId } = req.query;
    const { data: conversations } = await supabase.from("conversations").select("id").eq("user_id", userId);
    const conversationIds = conversations.map(item => item.id);

    if (conversationIds.length === 0) {
        return res.json({
            totalPlants: 0,
            totalScans: 0,
            averageHealth: 0
        });
    }

    const { data: scans } = await supabase.from("plant_scans").select("conversation_id, health_score").in("conversation_id", conversationIds);
    const totalScans = scans?.length || 0;
    const averageHealth = totalScans > 0? Math.round((scans || []).reduce((sum, item) => 
        sum + (item.health_score || 0), 0) / totalScans) : 0;

    const plantConversationIds = new Set(
        (scans || []).map((scan) => scan.conversation_id)
    );

    res.json({
        totalPlants: plantConversationIds.size,
        totalScans,
        averageHealth
    });
});

app.get("/api/journey/list", async (req, res) => {
    try {
        const { userId } = req.query;
        const { data: conversations } = await supabase.from("conversations").select("id, title, created_at")
            .eq("user_id", userId).order("created_at", { ascending: false });

        if (!conversations || conversations.length === 0) {
            return res.json([]);
        }

        const conversationIds = conversations.map((item) => item.id);

        const { data: scans } = await supabase.from("plant_scans").select(`
            conversation_id,
            plant_name,
            health_score,
            image_url,
            created_at
        `).in("conversation_id", conversationIds).order("created_at", { ascending: false });

        const journeys = conversations.map((conversation) => {
            const relatedScans = scans.filter((scan) =>
                scan.conversation_id === conversation.id
            );

            if (relatedScans.length === 0) {
                return null;
            }

            const latestScan = relatedScans[0];
            const averageHealth = Math.round(
                relatedScans.reduce(
                    (sum, item) => sum + (item.health_score || 0),
                    0
                ) / relatedScans.length
            );

            return {
                id: conversation.id,
                title: latestScan?.plant_name || conversation.title,
                scanCount: relatedScans.length,
                averageHealth,
                latestImage: latestScan?.image_url || null
            };
        }).filter(Boolean);

        res.json(journeys);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to fetch journeys"
        });
    }
});

app.get("/api/journey/:id", async(req,res)=>{

    const { id } = req.params;

    const { data: scans, error } = await supabase.from("plant_scans").select("*")
                .eq("conversation_id", id).order("created_at", {ascending:false});

    if(error){
        return res.status(500).json({
            error:error.message
        });
    }
    res.json(scans);
});

app.listen(PORT, () => {
    console.log(`PlantPal backend running on port ${PORT}`);
});