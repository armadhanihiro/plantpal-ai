import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";

import { askPlantAI } from "../services/aiService";

import Hero from "../components/Hero";
import UploadBox from "../components/UploadBox";
import ImagePreview from "../components/ImagePreview";
import SuggestionChips from "../components/SuggestionChips";
import EmptyState from "../components/EmptyState";
import ChatMessages from "../components/ChatMessages";
import Footer from "../components/Footer";

import "../App.css";

function Home({conversationId, setConversationId, messages, setMessages, refreshConversations, resetKey, plantData, setPlantData}) {
    const [image, setImage] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [question, setQuestion] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState("");
    const textareaRef = useRef(null);


    useEffect(() => {
        setImage(null);
        setImageFile(null);
        setPlantData(null);
        setQuestion("");
        setLoading(false);
        setResult("");
    }, [resetKey]);
    
    const handleImageUpload = (e) => {
        const file = e.target.files[0];

        if(file){
            setImage(
                URL.createObjectURL(file)
            );

            setImageFile(file)
        }
    };

    const handleSubmit = async () => {
        if (!question.trim()) return;

        setLoading(true);

        const userMessage = {
            role:"user", 
            content:question
        };

        setMessages(prev => [...prev, userMessage]);

        setQuestion("");

        const response = await askPlantAI(question, imageFile, conversationId);
        setConversationId(response.conversationId);

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

                        <UploadBox handleImageUpload={handleImageUpload}/>
                        
                        <ImagePreview image={image} plantData={plantData}/>

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

                        <textarea 
                            ref={textareaRef}
                            placeholder="Ask something about your plant..."
                            value={question}
                            onChange={(e)=>setQuestion(e.target.value)}
                        />

                        <button onClick={handleSubmit} disabled={loading}>
                            <Send size={18}/>
                            Ask PlantPal
                        </button>

                    </main>

                    <Footer />
                </>
            </div>
    );
}

export default Home