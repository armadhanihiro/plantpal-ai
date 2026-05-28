import {BrowserRouter, Routes, Route} from "react-router-dom";
import { useState, useEffect } from "react";

import Navbar from "./components/Navbar";
import ConversationSidebar from "./components/ConversationSidebar";

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

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [conversations, setConversations] = useState([]);
    const [conversationId, setConversationId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [plantData, setPlantData] = useState(null);
    const [image, setImage] = useState(null);

    useEffect(()=>{
        localStorage.setItem(
            "dark-mode",
            JSON.stringify(darkMode)
        );
        document.body.classList.toggle("dark-body", darkMode)
    },[darkMode])

    const refreshConversations = async () => {
        const data = await getConversations();
        setConversations(data);
    };

    useEffect(() => {
        refreshConversations();
    }, []);

    const handleSelectConversation = async (id) => {
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
                    conversations={conversations}
                    activeConversationId={conversationId}
                    onSelectConversation={handleSelectConversation}
                    onNewChat={handleNewChat}
                    onDeleteConversation={handleDeleteConversation}
                    onRenameConversation={handleRenameConversation}
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