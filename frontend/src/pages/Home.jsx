import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";

import { askPlantAI } from "../services/aiService";

import Hero from "../components/Hero";
import UploadBox from "../components/UploadBox";
import ImagePreview from "../components/ImagePreview";
import SuggestionChips from "../components/SuggestionChips";
import EmptyState from "../components/EmptyState";
import ResultCard from "../components/ResultCard";
import HistoryCard from '../components/HistoryCard'
import Footer from "../components/Footer";

import "../App.css";

function Home() {
    const [image, setImage] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [plantData, setPlantData] = useState(null);
    const [question, setQuestion] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState("");
    const textareaRef = useRef(null);

    const [history, setHistory] = useState(()=>{
        const saved =
            localStorage.getItem(
                "plantpal-history"
            );

        return saved
            ? JSON.parse(saved)
            : [];
    });

    useEffect(()=>{

        localStorage.setItem(
            "plantpal-history",
            JSON.stringify(history)
        );

    },[history]);
    
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

        const response = await askPlantAI(question, imageFile);
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

        setHistory(prev => [question, ...prev].slice(0,10))

        setLoading(false);
    };

    return (
        <div className="app">

            <Hero />

            <main className="card">

                <UploadBox handleImageUpload={handleImageUpload}/>
                
                <ImagePreview image={image} plantData={plantData}/>

                <SuggestionChips 
                    setQuestion={setQuestion}
                    textareaRef={textareaRef}
                />

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

                {
                    !result && !loading &&
                    <EmptyState/>
                }
                {
                    loading ? (
                        <div className="thinking">
                            <div className="thinking-dots">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>

                            <p>🌱 PlantPal is thinking...</p>
                        </div>
                    ) : (
                        <ResultCard result={result}/>
                    )
                }

                <HistoryCard 
                    history={history}
                    setQuestion={setQuestion}
                    textareaRef={textareaRef}
                />

            </main>

            <Footer />

        </div>
    );
}

export default Home