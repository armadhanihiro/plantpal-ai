import { Leaf } from "lucide-react";
import { useState } from "react";

function ConversationSidebar({conversations, activeConversationId, onSelectConversation, onNewChat, 
    onDeleteConversation, onRenameConversation, sidebarOpen, setSidebarOpen}) {
    
    const [openMenuId, setOpenMenuId] = useState(null);

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

                                <button className="conversation-menu-btn" onClick={(e) => {
                                        e.stopPropagation();
                                        setOpenMenuId(
                                            openMenuId === item.id ? null : item.id
                                        );
                                }}>
                                    ...
                                </button>

                                {
                                    openMenuId === item.id && (
                                        <div className="conversation-dropdown">
                                            <button onClick={(e) => {
                                                e.stopPropagation();
                                                const newTitle = prompt("Rename conversation:", item.title);

                                                if (newTitle && newTitle.trim()) {
                                                    onRenameConversation(
                                                        item.id,
                                                        newTitle.trim()
                                                    );
                                                }

                                                setOpenMenuId(null);
                                            }}>
                                                Rename
                                            </button>

                                            <button className="danger" onClick={(e) => {
                                                    e.stopPropagation();
                                                    onDeleteConversation(item.id);
                                                    setOpenMenuId(null);
                                            }}>
                                                Delete
                                            </button>
                                        </div>
                                    )
                                }
                            </div>
                        ))
                    )
                }
            </div>
        </aside>
    );
}

export default ConversationSidebar;