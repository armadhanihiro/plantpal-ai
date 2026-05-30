import {BrowserRouter, Routes, Route} from "react-router-dom";
import { useState, useEffect } from "react";

import Navbar from "./components/Navbar";
import ConversationSidebar from "./components/ConversationSidebar";

import { supabase } from "./services/supabaseClient";

import AuthPage from "./pages/AuthPage";
import Home from "./pages/Home";
import CareGuide from "./pages/CareGuide";
import About from "./pages/About";

import {getConversations, getMessages, getConversationPlant, deleteConversation, renameConversation} from "./services/aiService";

function App(){

    const [darkMode,setDarkMode]=useState(()=>{
    
        return JSON.parse(
            localStorage.getItem(
                "dark-mode"
            )
        ) || false;

    });

    const [session, setSession] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [conversations, setConversations] = useState([]);
    const [conversationId, setConversationId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [plantData, setPlantData] = useState(null);
    const [image, setImage] = useState(null);

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
        setConversationId(id);
        const data = await getMessages(id);

        const formattedMessages = data.map((item) => ({
            role: item.role,
            content: item.content
        }));

        setMessages(formattedMessages);

        const plant = await getConversationPlant(id);
        // console.log("RESTORED PLANT:", plant);

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

            if (lastConversationId) {
                await handleSelectConversation(lastConversationId);
            }else if (conversations?.length > 0) {
                await handleSelectConversation(conversations[0].id);
            }
        }
        initializeApp();
    }, [session]);

    const handleNewChat = () => {
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
        <BrowserRouter>
            <div className="app-layout">

                <button className="sidebar-toggle" onClick={() => setSidebarOpen(prev => !prev)}>☰</button>

                {
                    sidebarOpen && (
                        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}/>
                    )
                }

                <ConversationSidebar
                    user={session?.user}
                    conversations={conversations}
                    activeConversationId={conversationId}
                    onSelectConversation={handleSelectConversation}
                    onNewChat={handleNewChat}
                    onDeleteConversation={handleDeleteConversation}
                    onRenameConversation={handleRenameConversation}
                    onLogout={handleLogout}
                    sidebarOpen={sidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                />

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
                            path="/guide"
                            element={<CareGuide />}
                        />

                        <Route
                            path="/about"
                            element={<About />}
                        />
                    </Routes>

                </div>
            </div>
        </BrowserRouter>
    )

}

export default App;