import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";

import { askPlantAI } from "../services/aiService";

import Hero from "../components/Hero";
import PlantPanel from "../components/PlantPanel";
import SuggestionChips from "../components/SuggestionChips";
import EmptyState from "../components/EmptyState";
import ChatMessages from "../components/ChatMessages";
import Footer from "../components/Footer";

import "../App.css";

function Home({userId, conversationId, setConversationId, messages, setMessages, refreshConversations, plantData, setPlantData, image, setImage}) {
    const [imageFile, setImageFile] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [question, setQuestion] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState("");
    const textareaRef = useRef(null);
    
    const handleImageUpload = (e) => {
        const file = e.target.files[0];

        if(file){
            setSelectedImage(URL.createObjectURL(file));
            setImageFile(file)
        }
    };

    const handleSubmit = async () => {
        if (!question.trim() && !imageFile) return;

        setLoading(true);

        const userMessage = {
            role:"user", 
            content:question.trim() || "Please analyze this plant.",
            image: selectedImage
        };

        setMessages(prev => [...prev, userMessage]);

        setQuestion("");

        const promptText = question.trim() || "Please analyze this plant.";

        const response = await askPlantAI(promptText, imageFile, conversationId, userId);
        
        setConversationId(response.conversationId);

        localStorage.setItem(
            "lastConversationId",
            response.conversationId
        );

        localStorage.removeItem("isNewChat");

        await refreshConversations();

        const assistantMessage = {
            role:"assistant",
            content:response.answer
        };

        setMessages(prev => [...prev, assistantMessage]);

        setResult(response.answer);


        setPlantData(
            {
                healthScore: response.healthScore,
                plantName: response.plantName,
                watering: response.watering,
                sunlight: response.sunlight,
                difficulty: response.difficulty

            }
        );

        if(response.imageUrl){
            setImage(response.imageUrl);
        }

        setImageFile(null);
        setSelectedImage(null);
        setLoading(false);
    };

    useEffect(() => {
        textareaRef.current?.focus();
    }, [messages]);

    const chatEndRef = useRef(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({
            behavior: "smooth"
        });
    }, [messages, loading]);

    return (
            
            <div className="app">
                <>
                    <Hero />

                    <main className="card">
                        <div className="chat-workspace">
                            <section className="chat-area">

                                {
                                    messages.length === 0 && !loading && !result && (
                                        <EmptyState />
                                    )
                                }

                                {
                                    messages.length === 0 && (
                                        <SuggestionChips 
                                            setQuestion={setQuestion}
                                            textareaRef={textareaRef}
                                        />
                                    )
                                }

                                {
                                    messages.length > 0 && (
                                        <ChatMessages messages={messages} />
                                    )
                                }

                                <div ref={chatEndRef}></div>

                                {
                                    loading && (
                                        <div className="thinking">
                                            <div className="thinking-dots">
                                                <span></span>
                                                <span></span>
                                                <span></span>
                                            </div>

                                            <p>🌱 PlantPal is thinking...</p>
                                        </div>
                                    )
                                }

                                {
                                    selectedImage && (
                                        <div className="selected-image-preview">
                                            <img src={selectedImage} alt="Selected plant"/>
                                            <button className="remove-image-btn" onClick={() => {
                                                    setSelectedImage(null);
                                                    setImageFile(null);
                                                }}
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    )
                                }

                                <div className="chat-input-area">
                                    <label className="chat-upload-btn">
                                        📎
                                        <input
                                            id="plant-upload"
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            hidden
                                        />
                                    </label>

                                    <textarea 
                                        ref={textareaRef}
                                        placeholder="Ask something about your plant..."
                                        value={question}
                                        onChange={(e)=>setQuestion(e.target.value)}
                                    />

                                    <button className="chat-send-btn" onClick={handleSubmit} disabled={loading}>
                                        <Send size={18}/>
                                    </button>

                                </div>
                            </section>

                            <PlantPanel image={image} plantData={plantData}/>
                        </div>
                    </main>

                    <Footer />
                </>
            </div>
    );
}

export default Home