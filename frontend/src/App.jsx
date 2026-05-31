import { Routes, Route, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

import Navbar from "./components/Navbar";
import ConversationSidebar from "./components/ConversationSidebar";

import { supabase } from "./services/supabaseClient";

import AuthPage from "./pages/AuthPage";
import Home from "./pages/Home";
import PlantJourney from "./pages/PlantJourney";
import Settings from "./pages/Settings";

import {getConversations, getMessages, getConversationPlant, deleteConversation, renameConversation} from "./services/aiService";

function App(){

    const [darkMode,setDarkMode]=useState(()=>{
    
        return JSON.parse(
            localStorage.getItem(
                "dark-mode"
            )
        ) || false;

    });

    const location = useLocation();
    const showConversationSidebar = location.pathname === "/";

    const [session, setSession] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [conversations, setConversations] = useState([]);
    const [conversationId, setConversationId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [plantData, setPlantData] = useState(null);
    const [image, setImage] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);

    useEffect(() => {
        async function getInitialSession() {
            const { data } = await supabase.auth.getSession();

            setSession(data.session);
            setAuthLoading(false);
        }

        getInitialSession();

        const { data } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setSession(session);
            }
        );

        return () => {
            data.subscription.unsubscribe();
        };
    }, []);

    useEffect(()=>{
        localStorage.setItem(
            "dark-mode",
            JSON.stringify(darkMode)
        );
        document.body.classList.toggle("dark-body", darkMode)
    },[darkMode])

    const handleSelectConversation = async (id) => {
        localStorage.setItem("lastConversationId", id);
        localStorage.removeItem("isNewChat");

        setConversationId(id);
        
        const data = await getMessages(id);

        const formattedMessages = data.map((item) => ({
            role: item.role,
            content: item.content,
            image: item.image_url
        }));

        setMessages(formattedMessages);

        const plant = await getConversationPlant(id);

        if(plant){
            setPlantData({
                healthScore: plant.health_score,
                plantName: plant.plant_name,
                watering: plant.watering,
                sunlight: plant.sunlight,
                difficulty: plant.difficulty
            });

            setImage(plant.image_url || null);
        }else {
            setPlantData(null);
            setImage(null)
        }
    };

    const refreshConversations = async () => {
        if (!session?.user?.id) return;

        const data = await getConversations(session.user.id);
        setConversations(data);
        return data;
    };

    useEffect(() => {
        async function initializeApp(){
            if(!session?.user?.id) return;

            const conversations = await refreshConversations();
            const lastConversationId = localStorage.getItem("lastConversationId");

            const isNewChat = localStorage.getItem("isNewChat");
            if (isNewChat === "true") {
                return;
            }

            if (lastConversationId) {
                await handleSelectConversation(lastConversationId);
            }else if (conversations?.length > 0) {
                await handleSelectConversation(conversations[0].id);
            }
        }
        initializeApp();
    }, [session]);

    const handleNewChat = () => {
        localStorage.removeItem("lastConversationId");
        localStorage.setItem("isNewChat", "true");

        setConversationId(null);
        setMessages([]);
        setPlantData(null);
        setImage(null);
    };

    const handleDeleteConversation = async (id) => {await deleteConversation(id);
        if (id === conversationId) {
            setConversationId(null);
            setMessages([]);
            setPlantData(null);
            setImage(null);
        }
 
        await refreshConversations();
    };

    const confirmDeleteConversation = async () => {
        if (!deleteTarget) return;

        await handleDeleteConversation(deleteTarget.id);
        setDeleteTarget(null);
    };

    const handleRenameConversation = async(id, title)=>{
        await renameConversation(id, title);
        await refreshConversations();
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();

        setSession(null);
        setConversationId(null);
        setMessages([]);
        setPlantData(null);
        setImage(null);
    };

    if (authLoading) {
        return null;
    }

    if (!session) {
        return <AuthPage />;
    }

    return(
        // <BrowserRouter>
            <div className="app-layout">

                <button className="sidebar-toggle" onClick={() => setSidebarOpen(prev => !prev)}>☰</button>

                {
                    sidebarOpen && (
                        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}/>
                    )
                }

                {showConversationSidebar && (
                    <ConversationSidebar
                        user={session?.user}
                        conversations={conversations}
                        activeConversationId={conversationId}
                        onSelectConversation={handleSelectConversation}
                        onNewChat={handleNewChat}
                        onDeleteConversation={handleDeleteConversation}
                        onRenameConversation={handleRenameConversation}
                        setDeleteTarget={setDeleteTarget}
                        onLogout={handleLogout}
                        sidebarOpen={sidebarOpen}
                        setSidebarOpen={setSidebarOpen}
                    />
                )}

                <div className={darkMode ? "app dark" : "app"}>
                    <Navbar
                        darkMode={darkMode}
                        setDarkMode={setDarkMode}
                    />

                    <Routes>
                        <Route
                            path="/"
                            element={
                                <Home
                                    userId={session.user.id}
                                    conversationId={conversationId}
                                    setConversationId={setConversationId}
                                    messages={messages}
                                    setMessages={setMessages}
                                    refreshConversations={refreshConversations}
                                    plantData={plantData}
                                    setPlantData={setPlantData}
                                    image={image}
                                    setImage={setImage}
                                />
                            }
                        />

                        <Route
                            path="/journey"
                            element={<PlantJourney userId={session.user.id} />}
                        />

                        <Route
                            path="/settings"
                            element={<Settings />}
                        />
                    </Routes>

                </div>
                {
                    deleteTarget && (
                        <div className="delete-modal-backdrop">
                            <div className="delete-modal">
                                <h3>Delete conversation?</h3>

                                <p>
                                    This will permanently delete
                                    <strong> {deleteTarget.title || "Untitled Plant Chat"} </strong>
                                    from your history.
                                </p>

                                <div className="delete-modal-actions">
                                    <button className="cancel-delete-btn" onClick={() => setDeleteTarget(null)}>
                                        Cancel
                                    </button>

                                    <button className="confirm-delete-btn" onClick={confirmDeleteConversation}>
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    )
                }
            </div>
        // </BrowserRouter>
    )

}

export default App;