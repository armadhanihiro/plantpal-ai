import { Leaf } from "lucide-react";

function Navbar() {
    return (
        <nav className="navbar">
            <div className="logo">
                <Leaf size={28}/>
                <span>PlantPal AI</span>
            </div>
        </nav>
    );
}

export default Navbar;