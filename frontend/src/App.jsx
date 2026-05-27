import {BrowserRouter, Routes, Route} from "react-router-dom";
import { useState, useEffect } from "react";

import Navbar from "./components/Navbar";
import ConversationSidebar from "./components/ConversationSidebar";

import Home from "./pages/Home";
import CareGuide from "./pages/CareGuide";
import About from "./pages/About";

import {getConversations, getMessages, getConversationPlant} from "./services/aiService";

function App(){

    const [darkMode,setDarkMode]=useState(()=>{
    
        return JSON.parse(
            localStorage.getItem(
                "dark-mode"
            )
        ) || false;

    });

    const [conversations, setConversations] = useState([]);
    const [conversationId, setConversationId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [resetKey, setResetKey] = useState(0);
    const [plantData, setPlantData] = useState(null);

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

        if(plant){
            setPlantData({
                healthScore: plant.health_score,
                plantName: plant.plant_name,
                watering: plant.watering,
                sunlight: plant.sunlight,
                difficulty: plant.difficulty
            });
        }else {
            setPlantData(null);
        }
        setResetKey(prev => prev + 1);
    };

    const handleNewChat = () => {
        setConversationId(null);
        setMessages([]);
        setResetKey(prev => prev + 1);
    };


    return(
        <BrowserRouter>
            <div className="app-layout">

                <ConversationSidebar
                    conversations={conversations}
                    activeConversationId={conversationId}
                    onSelectConversation={handleSelectConversation}
                    onNewChat={handleNewChat}
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
                                    resetKey={resetKey}
                                    plantData={plantData}
                                    setPlantData={setPlantData}
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