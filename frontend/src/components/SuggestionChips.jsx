function SuggestionChips({ setQuestion, textareaRef }) {

    const suggestions = [
        "Why are my leaves turning yellow?",
        "How often should I water my plant?",
        "Does this plant need sunlight?"
    ];

    return (
        <div className="chips">

            {suggestions.map((item,index)=>(
                <button
                    key={index}
                    className="chip"
                    onClick={()=> {
                        setQuestion(item);
                        textareaRef.current.focus();
                    }}
                >
                    {item}
                </button>
            ))}

        </div>
    );
}

export default SuggestionChips;