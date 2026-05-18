function ResultCard({ result }) {
    if (!result) return null;

    return (
        <div className="result">
        {result}
        </div>
    );
}

export default ResultCard;