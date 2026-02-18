import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Top navigation bar with glassmorphism styling.
 * Shows user info and a logout button when authenticated.
 */
export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <nav className="sticky top-0 z-50 backdrop-blur-xl border-b border-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Brand */}
                    <Link to="/" className="flex items-center gap-2 no-underline">
                        <img src="/logo.svg" alt="SyncPad" className="w-9 h-9 rounded-xl shadow-lg" />
                        <span className="text-xl font-bold gradient-text tracking-tight">
                            SyncPad
                        </span>
                    </Link>

                    {/* Right side */}
                    {user ? (
                        <div className="flex items-center gap-4">
                            <div className="hidden sm:flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-sm font-bold">
                                    {user.name?.charAt(0).toUpperCase()}
                                </div>
                                <span className="text-sm text-text-secondary font-medium">
                                    {user.name}
                                </span>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="btn-secondary !py-2 !px-4 !text-sm"
                            >
                                Logout
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <Link to="/login">
                                <button className="btn-secondary !py-2 !px-4 !text-sm">
                                    Login
                                </button>
                            </Link>
                            <Link to="/register">
                                <button className="btn-primary !py-2 !px-4 !text-sm">
                                    Sign Up
                                </button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
