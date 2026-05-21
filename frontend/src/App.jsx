import {
 BrowserRouter,
 Routes,
 Route
}
from "react-router-dom";

import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import CareGuide from "./pages/CareGuide";
import About from "./pages/About";

function App(){

    return(
        <BrowserRouter>
            <Navbar/>

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
    )

}

export default App;