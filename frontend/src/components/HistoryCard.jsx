function HistoryCard({ history, setQuestion }) {

    if(history.length===0)
        return null;

    return (
        <div className="history-card">

            <h3>
                Recent Questions
            </h3>

            {
                history
                .slice(0,3)
                .map((item,index)=>(
                    <div
                        key={index}
                        className="history-item"
                        onClick={()=>
                            setQuestion(item)
                        }
                    >
                    • {item}
                    </div>
                ))
            }
        </div>
    );
}
export default HistoryCard;