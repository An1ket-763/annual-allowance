import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LeaveForm() {
    const navigate = useNavigate();
    const defaultEmail = localStorage.getItem("employeeEmail") || "";
    const [formData, setFormData] = useState({
        name: "",
        email: defaultEmail,
        from: "",
        to: "",
    });

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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const days = calcDaysInclusive(formData.from, formData.to);
        if (days <= 0) {
            alert("Please select a valid date range.");
            return;
        }

        // Build request object
        const req = {
            id: `req_${Date.now()}`,
            name: formData.name || "Anonymous",
            email: formData.email || defaultEmail || "unknown@demo.com",
            from: formData.from,
            to: formData.to,
            days,
            status: "pending",
            createdAt: new Date().toISOString(),
        };

        // push to leaveRequests (global)
        const allReqs = JSON.parse(localStorage.getItem("leaveRequests") || "[]");
        allReqs.unshift(req);
        localStorage.setItem("leaveRequests", JSON.stringify(allReqs));

        // Update personal leave data (local per employee) so they can see used/remaining locally
        const personalKey = `personalLeave_${req.email}`;
        const personal = JSON.parse(localStorage.getItem(personalKey) || "{}");
        const base = {
            total: personal.total ?? 30,
            used: (personal.used ?? 0) + days,
            remaining: Math.max((personal.total ?? 30) - ((personal.used ?? 0) + days), 0),
        };
        localStorage.setItem(personalKey, JSON.stringify(base));

        // notify employee and redirect
        localStorage.setItem("toast", "✅ Your leave request has been submitted!");
        navigate("/employee");
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
            <div className="bg-white rounded-2xl shadow-lg w-full max-w-lg p-8">
                <h2 className="text-2xl font-bold mb-6 text-center">Leave Request Form</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Name</label>
                        <input
                            type="text"
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <input
                            type="email"
                            name="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">From</label>
                            <input
                                type="date"
                                name="from"
                                required
                                value={formData.from}
                                onChange={handleChange}
                                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">To</label>
                            <input
                                type="date"
                                name="to"
                                required
                                value={formData.to}
                                onChange={handleChange}
                                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full py-2 rounded-md bg-indigo-600 text-white font-medium hover:bg-indigo-700 mt-4"
                    >
                        Submit Request
                    </button>
                </form>
            </div>
        </div>
    );
}
