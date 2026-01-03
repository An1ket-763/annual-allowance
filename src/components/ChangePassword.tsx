import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ChangePassword() {
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const submit = async () => {
        if (loading) return;

        setLoading(true);

        const token = localStorage.getItem("token");

        try {
            const res = await fetch("http://localhost:5000/api/auth/change-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ newPassword: password })
            });

            if (!res.ok) {
                throw new Error("Password change failed");
            }

            alert("Password updated. Please log in with your new password.");

            localStorage.removeItem("token");
            localStorage.removeItem("user");

            navigate("/login", { replace: true });
        } catch (err) {
            alert("Password change failed");
            setLoading(false); // allow retry only if failed
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="bg-white p-6 rounded-xl shadow w-96">
                <h2 className="text-xl font-bold mb-4">Change Password</h2>
                <input
                    type="password"
                    placeholder="New password"
                    className="border w-full p-2 mb-4"
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button
                    onClick={submit}
                    disabled={loading || !password}
                    className={`w-full py-2 rounded text-white ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-indigo-600"
                        }`}
                >
                    {loading ? "Updating..." : "Update Password"}
                </button>
            </div>
        </div>
    );
}
