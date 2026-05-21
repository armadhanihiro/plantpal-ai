import { Leaf } from "lucide-react";
import { Link } from "react-router-dom";

function Navbar() {
    return (
        <nav className="navbar">
            <div className="logo">
                <Leaf size={28}/>
                <span>PlantPal AI</span>
            </div>

            <div className="nav-links">
                <Link to="/">Home</Link>
                <Link to="/guide">Care Guide</Link>
                <Link to="/about">About</Link>
            </div>
        </nav>
    );
}

export default Navbar;