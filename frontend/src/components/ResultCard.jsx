function ResultCard({ result }) {
    if (!result) return null;

    return (
        <div className="result">
            <div className="result-header">
                🌱 PlantPal AI
            </div>

            <div className="result-content">
                {result}
            </div>
        </div>
    );
}

export default ResultCard;