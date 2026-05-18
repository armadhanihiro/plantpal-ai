import { useState } from "react";
import { Leaf, Send } from "lucide-react";
import { getPlantAdvice } from "./utils/plantAdvice";
import ResultCard from "./components/ResultCard";
import UploadBox from "./components/UploadBox";
import "./App.css";

function App() {
    const [image, setImage] = useState(null);
    const [question, setQuestion] = useState("");
    const [result, setResult] = useState("");
    
    const handleImageUpload = (e) => {
        const file = e.target.files[0];

        if(file){
            setImage(
                URL.createObjectURL(file)
            );
        }
    };

    const handleSubmit = () => {
        const advice = getPlantAdvice(question);
        setResult(advice);
    };

    return (
        <div className="app">
            <nav className="navbar">
                <div className="logo">
                <Leaf size={28}/>
                <span>PlantPal AI</span>
                </div>
            </nav>

            <section className="hero">
                <h1>Your AI Plant Care Assistant 🌱</h1>

                <p>
                Upload your plant photo and ask questions about
                plant care, health, and recommendations.
                </p>
            </section>

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

                <textarea 
                    placeholder="Ask something about your plant..."
                    value={question}
                    onChange={(e)=>setQuestion(e.target.value)}
                />

                <button onClick={handleSubmit}>
                    <Send size={18}/>
                    Ask PlantPal
                </button>

                <ResultCard result={result}/>

            </main>

        </div>
    );
}

export default App;