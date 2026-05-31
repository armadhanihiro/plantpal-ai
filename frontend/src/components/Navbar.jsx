import { Menu, X } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useState } from "react";

function Navbar({darkMode, setDarkMode}) {
    const [menuOpen,setMenuOpen] = useState(false);
    return (
        <nav className="navbar">

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
                        Chat
                </NavLink>

                <NavLink 
                    to="/journey" 
                    className={({isActive})=> isActive ?"nav-link active-link" :"nav-link"}
                    onClick={()=>setMenuOpen(false)}>
                        Journey
                </NavLink>

                <NavLink 
                    to="/settings" 
                    className={({isActive})=> isActive ?"nav-link active-link" :"nav-link"}
                    onClick={()=>setMenuOpen(false)}>
                        Settings
                </NavLink>

                <button className="mode-btn" onClick={()=> setDarkMode(!darkMode)}>{darkMode?"☀️":"🌙"}</button>
            </div>
        </nav>
    );
}

export default Navbar;