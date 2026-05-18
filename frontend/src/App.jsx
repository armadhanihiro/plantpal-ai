import { useState } from "react";
import { Send } from "lucide-react";

import { askPlantAI } from "./services/aiService";

import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import UploadBox from "./components/UploadBox";
import SuggestionChips from "./components/SuggestionChips";
import ResultCard from "./components/ResultCard";

import "./App.css";

function App() {
    const [image, setImage] = useState(null);
    const [question, setQuestion] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState("");
    
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

        setLoading(false);
    };

    return (
        <div className="app">
            <Navbar />

            <Hero />

            <main className="card">

                <UploadBox handleImageUpload={handleImageUpload}/>
                {
                    image && (
                        <img
                            src={image}
                            alt="plant"
                            className="preview"
                        />
                    )
                }

                <SuggestionChips setQuestion={setQuestion}/>

                <textarea 
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

                <ResultCard result={result}/>

            </main>

        </div>
    );
}

export default App;