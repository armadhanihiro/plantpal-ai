import { useState, useRef } from "react";
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
    const [question, setQuestion] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState("");
    const textareaRef = useRef(null);
    const [history, setHistory] = useState([])
    
    const handleImageUpload = (e) => {
        const file = e.target.files[0];

        if(file){
            setImage(
                URL.createObjectURL(file)
            );
        }
    };

    const handleSubmit = async () => {
        if (!question.trim()) return;

        setLoading(true);

        const response = await askPlantAI(question);
        setResult(response);
        setHistory((prev) => [
            question,
            ...prev
        ])

        setLoading(false);
    };

    return (
        <div className="app">

            <Hero />

            <main className="card">

                <UploadBox handleImageUpload={handleImageUpload}/>
                
                <ImagePreview image={image}/>

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
                    {loading
                        ? "Thinking..."
                        : "Ask PlantPal"
                    }
                </button>

                {
                    !result && !loading &&
                    <EmptyState/>
                }
                <ResultCard result={result}/>

                <HistoryCard history={history}/>

            </main>

            <Footer />

        </div>
    );
}

export default Home