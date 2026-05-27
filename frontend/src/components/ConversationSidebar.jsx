import { Leaf } from "lucide-react";

function ConversationSidebar({conversations, activeConversationId, onSelectConversation, onNewChat, 
    onDeleteConversation, sidebarOpen, setSidebarOpen}) {
    
    return (
        <aside className={sidebarOpen ? "conversation-sidebar sidebar-open" : "conversation-sidebar"}>

            <div className="sidebar-brand">
                <Leaf size={34} className="sidebar-logo"/>
                <div>
                    <h2>PlantPal AI</h2>
                    <p>Your AI Plant Care Assistant</p>
                </div>
            </div>

            <button
                className="new-chat-btn"
                onClick={() => {
                    onNewChat();
                    setSidebarOpen(false);
                }}
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
                            <div key={item.id} className={item.id === activeConversationId ? "conversation-row active-conversation" : "conversation-row"}>
                                <button className="conversation-item" onClick={() => {
                                        onSelectConversation(item.id);
                                        setSidebarOpen(false);
                                }}>
                                    {item.title || "Untitled Plant Chat"}
                                </button>

                                <button className="delete-conversation-btn" onClick={(e) => {
                                        e.stopPropagation();
                                        onDeleteConversation(item.id);
                                }}>
                                    ...
                                </button>
                            </div>
                        ))
                    )
                }
            </div>
        </aside>
    );
}

export default ConversationSidebar;