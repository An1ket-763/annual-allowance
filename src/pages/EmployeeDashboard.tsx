import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const getUserFromToken = () => {
    const token = localStorage.getItem("token");
    if (!token) return null;

    try {
        return JSON.parse(atob(token.split(".")[1]));
    } catch {
        return null;
    }
};


export default function EmployeeDashboard() {
    const navigate = useNavigate();
    const [toast, setToast] = useState<string | null>(null);

    const [leaveData, setLeaveData] = useState({ total: 30, used: 0, remaining: 30 });
    const [requests, setRequests] = useState<any[]>([]);
    const [email, setEmail] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/");
            return;
        }

        const payload = JSON.parse(atob(token.split(".")[1]));

        if (payload.mustChangePassword) {
            navigate("/change-password");
        }
    }, [navigate]);

    useEffect(() => {
        const user = getUserFromToken();
        if (user?.email) {
            setEmail(user.email);
        }
    }, []);

    const fetchLeaveBalance = async () => {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await fetch("http://localhost:5000/api/employees/me", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const data = await res.json();

        if (!res.ok) {
            alert(data.message || "Failed to load leave balance");
            return;
        }

        setLeaveData({
            total: data.total_leaves,
            used: data.used_leaves,
            remaining: data.remaining_leaves,
        });
    };

    const fetchMyLeaveRequests = async () => {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await fetch("http://localhost:5000/api/leaves", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const data = await res.json();

        if (!res.ok) {
            alert(data.message || "Failed to load leave history");
            return;
        }

        setRequests(data);
    };

    useEffect(() => {
        fetchLeaveBalance();
        fetchMyLeaveRequests();
    }, []);

    // Toast flag handling (from form submission)
    useEffect(() => {
        const flag = localStorage.getItem("toast");
        if (flag) {
            setToast(flag);
            setTimeout(() => {
                setToast(null);
                localStorage.removeItem("toast");
            }, 3000);
        }
    }, []);

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        navigate("/");
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
            {/* Top bar */}
            <header className="flex items-center justify-between px-6 py-4 bg-white shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M6 8H18" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M6 12H18" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M6 16H14" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <div>
                        <div className="font-semibold">Employee Portal</div>
                        <div className="text-sm text-slate-500">{email}</div>
                    </div>
                </div>

                <div>
                    <button
                        onClick={logout}
                        className="inline-flex items-center text-white bg-red-500 gap-2 border border-slate-200 px-3 py-2 rounded-md text-sm hover:bg-red-800"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M16 17L21 12L16 7" stroke="#e4ecfeff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M21 12H9" stroke="#e4e7eeff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M13 5H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h7" stroke="#e4e7eeff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Sign out
                    </button>
                </div>
            </header>

            {/* Hero */}
            <main className="max-w-6xl mx-auto px-6 py-8">
                <section className="mb-8">
                    <h1 className="text-4xl font-extrabold tracking-tight">Welcome Back!</h1>
                    <p className="text-slate-600 mt-2">Manage your leave requests and track your balance</p>
                </section>

                {/* Summary cards */}
                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <SummaryCard
                        title="Total Leaves"
                        subtitle="Days per year"
                        value={leaveData.total}
                        icon={(
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect x="3" y="4" width="18" height="18" rx="2" stroke="#0ea5a4" strokeWidth="1.2" />
                                <path d="M16 2V6" stroke="#0ea5a4" strokeWidth="1.2" strokeLinecap="round" />
                                <path d="M8 2V6" stroke="#0ea5a4" strokeWidth="1.2" strokeLinecap="round" />
                            </svg>
                        )}
                    />

                    <SummaryCard
                        title="Used"
                        subtitle="% utilized"
                        value={`${leaveData.used}`}
                        icon={(
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="12" r="9" stroke="#f59e0b" strokeWidth="1.2" />
                                <path d="M12 7v5l3 3" stroke="#f59e0b" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        )}
                    />

                    <SummaryCard
                        title="Remaining"
                        subtitle="Days available"
                        value={leaveData.remaining}
                        icon={(
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 2a10 10 0 100 20 10 10 0 000-20z" stroke="#10b981" strokeWidth="1.2" />
                                <path d="M9.5 12.5l1.8 1.8L15 10.6" stroke="#10b981" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        )}
                    />

                    <SummaryCard
                        title="Requests"
                        subtitle="Total submitted"
                        value={requests.length}
                        icon={(
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M9 14l2-2 4 4" stroke="#3b82f6" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                                <rect x="3" y="3" width="18" height="18" rx="2" stroke="#3b82f6" strokeWidth="1.2" />
                            </svg>
                        )}
                    />
                </section>

                {/* Quick Actions */}
                <section className="mt-8 bg-gradient-to-r from-emerald-50 to-sky-50 p-6 rounded-2xl shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-semibold">Quick Actions</h3>
                            <p className="text-slate-600 mt-1">Request time off or view your leave history</p>
                        </div>

                        <div>
                            <button
                                onClick={() => navigate('/request-leave')}
                                className="inline-flex items-center gap-3 px-4 py-2 rounded-md bg-gradient-to-r from-emerald-600 to-sky-500 text-white shadow hover:opacity-95"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                Request Leave
                            </button>
                        </div>
                    </div>
                </section>

                {/* Request history table (condensed) */}
                {requests.length > 0 && (
                    <section className="mt-8 bg-white p-6 rounded-2xl shadow">
                        <h4 className="font-semibold mb-4">Your Leave Requests</h4>
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="p-3 text-left">From</th>
                                        <th className="p-3 text-left">To</th>
                                        <th className="p-3 text-left">Days</th>
                                        <th className="p-3 text-left">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {requests.map((r) => (
                                        <tr key={r.id} className="border-t">
                                            <td className="p-3">{r.start_date}</td>
                                            <td className="p-3">{r.end_date}</td>
                                            <td className="p-3">{r.days}</td>
                                            <td className={`p-3 font-medium ${r.status === 'APPROVED' ? 'text-emerald-600' : r.status === 'DECLINED' ? 'text-red-500' : 'text-yellow-600'}`}>
                                                {r.status}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                )}

                {/* Toast */}
                {toast && (
                    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-6 py-3 rounded-full shadow-lg animate-bounce">
                        {toast}
                    </div>
                )}
            </main>
        </div>
    );
}

function SummaryCard({ title, subtitle, value, icon }: { title: string; subtitle?: string; value: string | number; icon?: React.ReactNode; }) {
    return (
        <div className="rounded-2xl bg-white p-5 shadow flex items-center gap-4 border">
            <div className="w-14 h-14 bg-slate-50 rounded-lg flex items-center justify-center">{icon}</div>
            <div>
                <div className="text-sm text-slate-500">{title}</div>
                <div className="mt-1 text-2xl font-bold">{value}</div>
                {subtitle && <div className="text-xs text-slate-400 mt-1">{subtitle}</div>}
            </div>
        </div>
    );
}