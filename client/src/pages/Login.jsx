import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            await login(email, password);
            navigate("/");
        } catch (err) {
            setError(err.response?.data?.message || "Login failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="w-full max-w-md fade-in">
                {/* Header */}
                <div className="text-center mb-8">
                    <img src="/logo.svg" alt="SyncPad" className="w-16 h-16 rounded-2xl mx-auto mb-4 shadow-lg pulse-glow" />
                    <h1 className="text-3xl font-bold gradient-text">Welcome Back</h1>
                    <p className="text-text-secondary mt-2">
                        Sign in to continue collaborating
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="glass-card p-8 space-y-5">
                    {error && (
                        <div className="p-3 rounded-xl bg-danger/10 border border-danger/30 text-danger text-sm">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1.5">
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            className="input-field"
                            required
                            autoComplete="email"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1.5">
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="input-field"
                            required
                            autoComplete="current-password"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary w-full flex items-center justify-center gap-2"
                    >
                        {loading ? <div className="spinner !w-5 !h-5" /> : "Sign In"}
                    </button>

                    <p className="text-sm text-center text-text-muted">
                        Don&apos;t have an account?{" "}
                        <Link to="/register" className="text-primary hover:text-primary-light font-semibold">
                            Create one
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
