import ReactMarkdown from "react-markdown";

function ResultCard({ result }) {
    if (!result) return null;

    return (
        <div className="result">
            <div className="result-header">
                🌱 PlantPal AI
            </div>

            <div className="result-content">
                <ReactMarkdown>{result}</ReactMarkdown>
            </div>
        </div>
    );
}

export default ResultCard;