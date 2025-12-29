import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LeaveForm() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        startDate: "",
        endDate: "",
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const calcDaysInclusive = (fromStr: string, toStr: string) => {
        const from = new Date(fromStr);
        const to = new Date(toStr);
        if (isNaN(from.getTime()) || isNaN(to.getTime())) return 0;
        const diffMs = to.getTime() - from.getTime();
        const days = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
        return days > 0 ? days : 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const days = calcDaysInclusive(formData.startDate, formData.endDate);
        if (days <= 0) {
            alert("Please select a valid date range.");
            return;
        }

        const token = localStorage.getItem("token");
        if (!token) {
            alert("Not authenticated");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch("http://localhost:5000/api/leaves", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    startDate: formData.startDate,
                    endDate: formData.endDate,
                    days,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.message || "Failed to submit leave request");
                setLoading(false);
                return;
            }

            alert("✅ Leave request submitted");
            navigate("/employee");

        } catch (err) {
            alert("Server not reachable");
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
            <div className="bg-white rounded-2xl shadow-lg w-full max-w-lg p-8">
                <h2 className="text-2xl font-bold mb-6 text-center">Leave Request Form</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">From</label>
                            <input
                                type="date"
                                name="startDate"
                                required
                                value={formData.startDate}
                                onChange={handleChange}
                                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">To</label>
                            <input
                                type="date"
                                name="endDate"
                                required
                                value={formData.endDate}
                                onChange={handleChange}
                                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2 rounded-md bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:opacity-70 mt-4"
                    >
                        {loading ? "Submitting..." : "Submit Request"}
                    </button>
                </form>
            </div>
        </div>
    );
}
