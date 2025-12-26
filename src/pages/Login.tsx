import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch("http://localhost:5000/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.message || "Login failed");
                setLoading(false);
                return;
            }

            // Save auth data
            localStorage.setItem("token", data.token);
            localStorage.setItem("role", data.role);
            // Redirect based on role
            if (data.role.includes("ADMIN")) {
                navigate("/admin");
            } else {
                navigate("/employee");
            }

        } catch (err) {
            setError("Server not reachable");
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-slate-50">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div className="p-6 border-b">
                        <h1 className="text-2xl font-bold">LeaveTracker</h1>
                        <p className="text-sm text-slate-500 mt-1">
                            Sign in with your company credentials
                        </p>
                    </div>

                    <form className="p-6" onSubmit={onSubmit}>
                        {error && (
                            <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-2">
                                {error}
                            </div>
                        )}

                        <div className="mb-4">
                            <label className="text-sm font-medium block mb-1">Email</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-3 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-indigo-200"
                                placeholder="you@company.com"
                            />
                        </div>

                        <div className="mb-6">
                            <label className="text-sm font-medium block mb-1">Password</label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-3 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-indigo-200"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2 rounded-md bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:opacity-70"
                        >
                            {loading ? "Signing in..." : "Sign In"}
                        </button>
                    </form>
                </div>

                <div className="mt-6 text-center text-sm text-slate-500">
                    Secure login • Role-based access
                </div>
            </div>
        </div>
    );
}