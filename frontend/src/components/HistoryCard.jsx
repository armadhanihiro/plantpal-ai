function HistoryCard({ history, setQuestion, textareaRef }) {

    if(history.length===0)
        return null;

    return (
        <div className="history-card">
            <h3>Recent Questions</h3>
            {
                history.map( (item,index)=>(
                        <div key={index} className= "history-item" onClick={()=>{
                                setQuestion(
                                    item.answer
                                );
                                textareaRef.current ?.focus();
                            }}
                        >
                            <strong>
                                {item.plant_name}
                            </strong>

                            <p>
                                {item.answer ?.slice(0,60)}
                                ...
                            </p>
                        </div>
                    )
                )
            }
        </div>
    );
}
export default HistoryCard;