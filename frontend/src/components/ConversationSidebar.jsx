import { Leaf } from "lucide-react";
import { useState } from "react";
import { NavLink } from "react-router-dom";

function ConversationSidebar({user, conversations, activeConversationId, onSelectConversation, onNewChat, 
             onRenameConversation, setDeleteTarget, onLogout, sidebarOpen, setSidebarOpen}) {
    
    const [openMenuId, setOpenMenuId] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [editingTitle, setEditingTitle] = useState("");

    return (
        <aside className={sidebarOpen ? "conversation-sidebar sidebar-open" : "conversation-sidebar"}
        onClick={() => setOpenMenuId(null)}>

            <div className="sidebar-brand">
                <Leaf size={34} className="sidebar-logo"/>
                <div>
                    <h2>PlantPal AI</h2>
                    <p>Your AI Plant Care Assistant</p>
                </div>
            </div>

            <div className="sidebar-nav-section">
                <h4>Navigation</h4>

                <NavLink
                    to="/"
                    className="sidebar-nav-link"
                    onClick={() => setSidebarOpen(false)}
                >
                    💬 Chat
                </NavLink>

                <NavLink
                    to="/journey"
                    className="sidebar-nav-link"
                    onClick={() => setSidebarOpen(false)}
                >
                    🌱 Journey
                </NavLink>

                <NavLink
                    to="/settings"
                    className="sidebar-nav-link"
                    onClick={() => setSidebarOpen(false)}
                >
                    ⚙️ Settings
                </NavLink>
            </div>

            <button
                className="new-chat-btn"
                onClick={() => {
                    onNewChat();
                    setSidebarOpen(false);
                }}
            >
                + New Plant
            </button>

            <h3>My Plants </h3>

            <div className="conversation-list">
                {
                    conversations.length === 0 ? (
                        <p className="empty-conversation">
                            No conversations yet
                        </p>
                    ) : (
                        conversations.map((item) => (
                            <div key={item.id} className={item.id === activeConversationId ? "conversation-row active-conversation" : "conversation-row"}
                            onClick={(e) => e.stopPropagation}>
                                {
                                    editingId === item.id ? (
                                        <input
                                            className="conversation-rename-input"
                                            value={editingTitle}
                                            autoFocus
                                            onClick={(e) => e.stopPropagation()}
                                            onChange={(e) => setEditingTitle(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter" && editingTitle.trim()) {
                                                    onRenameConversation(item.id, editingTitle.trim());
                                                    setEditingId(null);
                                                    setEditingTitle("");
                                                    setOpenMenuId(null);
                                                }

                                                if (e.key === "Escape") {
                                                    setEditingId(null);
                                                    setEditingTitle("");
                                                }
                                            }}
                                        />
                                    ) : (
                                        <button
                                            className="conversation-item"
                                            onClick={() => {
                                                onSelectConversation(item.id);
                                                setSidebarOpen(false);
                                            }}
                                        >
                                            <span className="conversation-title">
                                                {item.title || "Untitled Plant Chat"}
                                            </span>
                                        </button>
                                    )
                                }

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
                                                setEditingId(item.id);
                                                setEditingTitle(item.title || "Untitled Plant Chat");
                                                setOpenMenuId(null);
                                            }}>
                                                Rename
                                            </button>

                                            <button className="danger" onClick={(e) => {
                                                    e.stopPropagation();
                                                    setDeleteTarget(item);
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

            <div className="sidebar-footer">
                <div className="sidebar-user">
                    <div className="sidebar-user-avatar">
                        {user?.email?.charAt(0).toUpperCase()}
                    </div>

                    <div className="sidebar-user-info">
                        <strong>{user?.email?.split("@")[0]}</strong>

                        <span>{user?.email}</span>
                    </div>

                </div>

                <button
                    className="logout-btn"
                    onClick={onLogout}
                >
                    Logout
                </button>
            </div>
        </aside>
    );
}

export default ConversationSidebar;