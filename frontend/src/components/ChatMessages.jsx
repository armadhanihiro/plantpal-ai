import ReactMarkdown from "react-markdown";

function ChatMessages({ messages }) {
    return (
        <div className="chat-messages">
            {
                messages.map((message,index)=>(
                        <div
                            key={index}
                            className={message.role === "user" ? "message user" : "message assistant"}
                        >
                             {
                            message.image && (
                                <img src={message.image} alt="Uploaded plant" className="message-image"/>
                            )
                        }

                        {
                            message.content && (
                                <ReactMarkdown>
                                    {message.content}
                                </ReactMarkdown>
                            )
                        }
                        </div>
                    )
                )
            }
        </div>

    );

}

export default ChatMessages;