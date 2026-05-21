import { Menu, X, Leaf } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useState } from "react";

function Navbar({darkMode, setDarkMode}) {
    const [menuOpen,setMenuOpen] = useState(false);
    return (
        <nav className="navbar">
            <div className="logo">
                <Leaf size={28}/>
                <span>PlantPal AI</span>
            </div>


            <button className="menu-btn" onClick={()=> setMenuOpen(!menuOpen)}>
                {
                    menuOpen
                    ?<X size={24}/>
                    :<Menu size={24}/>
                }
            </button>

            <div className={menuOpen ?"nav-links open" :"nav-links"}>
                <NavLink 
                to="/" 
                className={({isActive})=> isActive ?"nav-link active-link":"nav-link"}
                onClick={()=>setMenuOpen(false)}>
                    Home
                </NavLink>

                <NavLink 
                to="/guide" 
                className={({isActive})=> isActive ?"nav-link active-link" :"nav-link"}
                onClick={()=>setMenuOpen(false)}>
                    Care Guide
                </NavLink>

                <NavLink 
                to="/about" 
                className={({isActive})=> isActive ?"nav-link active-link" :"nav-link"}
                onClick={()=>setMenuOpen(false)}>
                    About
                </NavLink>

                <button className="mode-btn" onClick={()=> setDarkMode(!darkMode)}>{darkMode?"☀️":"🌙"}</button>
            </div>
        </nav>
    );
}

export default Navbar;