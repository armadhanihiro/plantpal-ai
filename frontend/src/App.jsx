import {BrowserRouter, Routes, Route} from "react-router-dom";
import { useState, useEffect } from "react";

import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import CareGuide from "./pages/CareGuide";
import About from "./pages/About";

function App(){

    const [darkMode,setDarkMode]=useState(()=>{
    
        return JSON.parse(
            localStorage.getItem(
                "dark-mode"
            )
        ) || false;

    });

    useEffect(()=>{
        localStorage.setItem(
            "dark-mode",
            JSON.stringify(darkMode)
        );
        document.body.classList.toggle("dark-body", darkMode)
    },[darkMode])

    return(
        <div className={darkMode ?"app dark" :"app"}>
            <BrowserRouter>
                <Navbar darkMode={darkMode} setDarkMode={setDarkMode}/>

                <Routes>
                    <Route
                    path="/"
                    element={<Home/>}
                    />

                    <Route
                    path="/guide"
                    element={<CareGuide/>}
                    />

                    <Route
                    path="/about"
                    element={<About/>}
                    />
                </Routes>
            </BrowserRouter>
        </div>
    )

}

export default App;