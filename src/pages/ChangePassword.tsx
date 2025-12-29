import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ChangePassword() {
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const submit = async () => {
        const token = localStorage.getItem("token");

        const res = await fetch("http://localhost:5000/api/auth/change-password", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ newPassword: password })
        });

        if (!res.ok) {
            alert("Password change failed");
            return;
        }

        alert("Password updated");
        navigate("/employee");
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
                    className="w-full bg-indigo-600 text-white py-2 rounded"
                >
                    Update Password
                </button>
            </div>
        </div>
    );
}
