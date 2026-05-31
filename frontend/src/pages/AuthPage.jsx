import { useState } from "react";
import { Leaf, Sparkles, Sprout } from "lucide-react";
import { supabase } from "../services/supabaseClient";
// import { redirect } from "react-router-dom";

function AuthPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const getFriendlyError = (message) => {
        const lowerMessage = message.toLowerCase();

        if (lowerMessage.includes("invalid login credentials")) {
            return "Email or password is incorrect. Please try again.";
        }

        if (lowerMessage.includes("user already registered")) {
            return "This email is already registered. Please login instead.";
        }

        if (lowerMessage.includes("password")) {
            return "Password should be at least 6 characters.";
        }

        if (lowerMessage.includes("email")) {
            return "Please enter a valid email address.";
        }

        return "Something went wrong. Please try again.";
    };

    const resetForm = () => {
        setEmail("");
        setPassword("");
        setMessage("");
    };

    const handleAuth = async (e) => {
        e.preventDefault();

        setLoading(true);
        setMessage("");

        const { error } = isLogin ? await supabase.auth.signInWithPassword({
                email,
                password
            }) : await supabase.auth.signUp({
                email,
                password
            });

        if (error) {
            setMessage(getFriendlyError(error.message));
            setLoading(false);
            return;
        }

        setMessage(isLogin ? "Welcome back to PlantPal 🌱" : "Welcome to PlantPal 🌱");
        setLoading(false);
    };

    const handleGoogleLogin = async () => {
        const redirectUrl = window.location.origin;
        await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: redirectUrl
            }
        });
    };

    return (
        <div className="auth-page cozy-auth">
            <div className="auth-illustration">
                <div className="auth-brand">
                    <div className="auth-brand-icon">
                        <Leaf size={32} />
                    </div>

                    <div>
                        <h1>PlantPal AI</h1>
                        <p>Your cozy AI companion for healthier plants.</p>
                    </div>
                </div>

                <div className="plant-orb">
                    <Sprout size={72} />
                </div>

                <div className="auth-benefits">
                    <div>
                        <Sparkles size={18} />
                        <span>AI-powered plant diagnosis</span>
                    </div>

                    <div>
                        <Leaf size={18} />
                        <span>Remember every plant conversation</span>
                    </div>

                    <div>
                        <Sprout size={18} />
                        <span>Track your plant care journey</span>
                    </div>
                </div>
            </div>

            <div className="auth-card cozy-auth-card">
                <div className="auth-card-header">
                    <h2>
                        {isLogin ? "Welcome back" : "Create your account"}
                    </h2>

                    <p>
                        {isLogin ? "Continue caring for your plants with PlantPal." : "Start your personal plant care journey today."}
                    </p>
                </div>

                <form onSubmit={handleAuth}>
                    <label>
                        Email
                        <input
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </label>

                    <label>
                        Password
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </label>

                    <button disabled={loading}>
                        {loading
                            ? "Please wait..."
                            : isLogin
                            ? "Login"
                            : "Create Account"}
                    </button>
                </form>

                <div className="auth-divider">
                    <span>OR</span>
                </div>

                <button type="button" className="google-login-btn" onClick={handleGoogleLogin}>
                    <img
                        src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                        alt="Google"
                        className="google-icon"
                    />
                    <span>Continue with Google</span>
                </button>

                {message && (
                    <p className="auth-message">
                        {message}
                    </p>
                )}

                <button
                    className="auth-toggle"
                    onClick={() => {
                        setIsLogin(!isLogin);
                        resetForm();
                    }}
                >
                    {isLogin ? "Don't have an account? Sign up" : "Already have an account? Login"}
                </button>
            </div>
        </div>
    );
}

export default AuthPage;