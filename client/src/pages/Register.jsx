import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { signup } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        setLoading(true);
        try {
            await signup(name, email, password);
            navigate("/");
        } catch (err) {
            setError(err.response?.data?.message || "Registration failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-8">
            <div className="w-full max-w-md fade-in">
                {/* Header */}
                <div className="text-center mb-8">
                    <img src="/logo.svg" alt="SyncPad" className="w-16 h-16 rounded-2xl mx-auto mb-4 shadow-lg pulse-glow" />
                    <h1 className="text-3xl font-bold gradient-text">Create Account</h1>
                    <p className="text-text-secondary mt-2">
                        Start collaborating in real time
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
                            Full Name
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="John Doe"
                            className="input-field"
                            required
                        />
                    </div>

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
                            autoComplete="new-password"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1.5">
                            Confirm Password
                        </label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                            className="input-field"
                            required
                            autoComplete="new-password"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary w-full flex items-center justify-center gap-2"
                    >
                        {loading ? <div className="spinner !w-5 !h-5" /> : "Create Account"}
                    </button>

                    <p className="text-sm text-center text-text-muted">
                        Already have an account?{" "}
                        <Link to="/login" className="text-primary hover:text-primary-light font-semibold">
                            Sign in
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
