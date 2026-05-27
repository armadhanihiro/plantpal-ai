import { Leaf } from "lucide-react";

function ConversationSidebar({conversations, activeConversationId, onSelectConversation, onNewChat}) {
    
    console.log(conversations);
    
    return (
        <aside className="conversation-sidebar">

            <div className="sidebar-brand">
                <Leaf size={34} className="sidebar-logo"/>
                <div>
                    <h2>PlantPal AI</h2>
                    <p>Your AI Plant Care Assistant</p>
                </div>
            </div>

            <button
                className="new-chat-btn"
                onClick={onNewChat}
            >
                + New Chat
            </button>

            <h3>Conversations</h3>

            <div className="conversation-list">
                {
                    conversations.length === 0 ? (
                        <p className="empty-conversation">
                            No conversations yet
                        </p>
                    ) : (
                        conversations.map((item) => (
                            <button
                                key={item.id}
                                className={
                                    item.id === activeConversationId
                                        ? "conversation-item active-conversation"
                                        : "conversation-item"
                                }
                                onClick={() => onSelectConversation(item.id)}
                            >
                                {item.title || "Untitled Plant Chat"}
                            </button>
                        ))
                    )
                }
            </div>
        </aside>
    );
}

export default ConversationSidebar;