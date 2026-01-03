import { useState, useEffect } from "react";

interface AddEmployeeProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function AddEmployee({
    isOpen,
    onClose,
    onSuccess,
}: AddEmployeeProps) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && !loading) {
                onClose();
            }
        };

        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen, onClose, loading]);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        const token = localStorage.getItem("token");
        if (!token) return alert("Not authenticated");

        setLoading(true);

        const res = await fetch("http://localhost:5000/api/admin/employees", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await res.json();
        setLoading(false);

        if (!res.ok) {
            alert(data.message || "Failed to add employee");
            return;
        }

        setEmail("");
        setPassword("");
        onSuccess();
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={() => {
                    if (!loading) onClose();
                }}
            />

            {/* Modal */}
            <div className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-xl animate-scaleIn">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">
                    Add New Employee
                </h2>

                <div className="space-y-4">
                    <input
                        type="email"
                        placeholder="Employee Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-md border px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                    />

                    <input
                        type="password"
                        placeholder="Temporary Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full rounded-md border px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-md border text-slate-600 hover:bg-slate-100"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
                    >
                        {loading ? "Creating..." : "Create"}
                    </button>
                </div>
            </div>
        </div>
    );
}