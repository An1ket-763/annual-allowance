import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AddEmployee from "../components/AddEmployee";

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [employees, setEmployees] = useState<Record<string, any>>({});
    const [requests, setRequests] = useState<any[]>([]);
    const [toast, setToast] = useState<string | null>(null);
    const [showAddEmployee, setShowAddEmployee] = useState(false);
    const [showEmployees, setShowEmployees] = useState(false);
    const [showRequests, setShowRequests] = useState(false);

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

    const fetchLeaveRequests = async () => {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await fetch("http://localhost:5000/api/leaves/admin", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const data = await res.json();

        if (!res.ok) {
            alert(data.message || "Failed to load leave requests");
            return;
        }

        setRequests(data);
    };

    const fetchEmployees = async () => {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await fetch("http://localhost:5000/api/admin/employees", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const data = await res.json();

        if (!res.ok) {
            alert(data.message || "Failed to load employees");
            return;
        }

        const formatted: any = {};
        data.forEach((emp: any) => {
            formatted[emp.email] = {
                total: emp.total_leaves,
                used: emp.used_leaves,
                remaining: emp.remaining_leaves,
                userId: emp.user_id, // IMPORTANT for delete
            };
        });

        setEmployees(formatted);
    };

    useEffect(() => {
        fetchEmployees();
        fetchLeaveRequests();
    }, []);

    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(null), 3000);
    };

    // ------------------ APPROVE / DECLINE ------------------
    const updateRequestStatus = async (
        id: number,
        status: "APPROVED" | "DECLINED"
    ) => {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await fetch(
            `http://localhost:5000/api/leaves/admin/${id}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ status }),
            }
        );

        const data = await res.json();

        if (!res.ok) {
            alert(data.message || "Action failed");
            return;
        }

        showToast(`Leave ${status.toLowerCase()}`);
        fetchLeaveRequests();
    };

    const removeEmployee = async (userId: number) => {
        const ok = window.confirm("Remove employee?");
        if (!ok) return;

        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await fetch(
            `http://localhost:5000/api/admin/employees/${userId}`,
            {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        if (!res.ok) {
            alert("Failed to remove employee");
            return;
        }

        showToast("Employee removed");
        fetchEmployees(); // ✅ NOW WORKS
    };


    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        navigate("/");
    };

    // ------------------ UI helpers ------------------
    const totalEmployees = Object.keys(employees).length;
    const pendingCount = requests.filter((r) => r.status === "PENDING").length;
    const approvedCount = requests.filter((r) => r.status === "APPROVED").length;
    const declinedCount = requests.filter((r) => r.status === "DECLINED").length;

    return (
        <div className="min-h-screen bg-slate-50 text-slate-700">
            {/* Top header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
                            {/* simple calendar icon */}
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3M3 11h18M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div>
                            <div className="text-sm text-slate-500">Leave Manager</div>
                            <div className="font-semibold">Admin Dashboard</div>
                        </div>
                    </div>

                    <div>
                        <button
                            onClick={logout}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border bg-red-500 hover:bg-red-800 text-sm text-white hover:shadow"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7" />
                            </svg>
                            Sign out
                        </button>
                    </div>
                </div>
            </div>

            <main className="max-w-6xl mx-auto p-6">
                {/* Stat cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <StatCard title="Total Employees" value={totalEmployees} icon="users" />
                    <StatCard title="Pending Requests" value={pendingCount} icon="clock" />
                    <StatCard title="Approved" value={approvedCount} icon="check" accent="emerald" />
                    <StatCard title="Declined" value={declinedCount} icon="x" accent="rose" />
                </div>

                {/* Content area */}
                <div className="bg-white rounded-2xl shadow p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold">Employee Leave Records</h2>
                        <button
                            onClick={() => setShowAddEmployee(true)}
                            className="px-4 py-2 rounded-md bg-indigo-600 text-white text-sm"
                        >
                            + Add Employee
                        </button>

                        <div className="flex items-center gap-3">
                            <div className="text-sm text-slate-400">{totalEmployees} employees</div>

                            {/* NEW: toggle button */}
                            <button
                                onClick={() => setShowEmployees((s) => !s)}
                                aria-expanded={showEmployees}
                                className="inline-flex items-center gap-2 px-3 py-1 rounded-lg border bg-slate-50 text-sm text-slate-600 hover:shadow"
                            >
                                {showEmployees ? "Hide" : "Show"}
                                <svg xmlns="http://www.w3.org/2000/svg" className={`w-4 h-4 transform ${showEmployees ? "rotate-180" : "rotate-0"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Collapsible area - employee table (hidden by default) */}
                    {showEmployees && (
                        <div className="overflow-x-auto transition-all duration-200">
                            <table className="min-w-full text-sm">
                                <thead>
                                    <tr className="text-slate-500 text-xs tracking-wider">
                                        <th className="py-3 text-left">Email</th>
                                        <th className="py-3 text-left">Total</th>
                                        <th className="py-3 text-left">Used</th>
                                        <th className="py-3 text-left">Remaining</th>
                                        <th className="py-3 text-left">Actions</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {totalEmployees === 0 && (
                                        <tr>
                                            <td colSpan={5} className="py-12 text-center text-slate-400">
                                                <div className="flex flex-col items-center gap-3">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 10-8 0v4M3 20a8 8 0 0116 0" />
                                                    </svg>
                                                    <div>No employees found.</div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}

                                    {Object.entries(employees).map(([email, data]: any) => (
                                        <tr key={email} className="border-t">
                                            <td className="py-3">{email}</td>
                                            <td className="py-3">{data.total}</td>
                                            <td className="py-3">{data.used}</td>
                                            <td className="py-3">{data.remaining}</td>
                                            <td className="py-3">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => removeEmployee(data.userId)}
                                                        className="px-3 py-1 rounded-md bg-red-500 text-white text-sm"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Leave requests section */}
                    <div className="mt-10">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold">Leave Requests</h2>
                            <div className="flex items-center gap-3">
                                <div className="text-sm text-slate-400">{requests.length} requests</div>

                                {/* NEW: toggle button for requests */}
                                <button
                                    onClick={() => setShowRequests((s) => !s)}
                                    aria-expanded={showRequests}
                                    className="inline-flex items-center gap-2 px-3 py-1 rounded-lg border bg-slate-50 text-sm text-slate-600 hover:shadow"
                                >
                                    {showRequests ? "Hide" : "Show"}
                                    <svg xmlns="http://www.w3.org/2000/svg" className={`w-4 h-4 transform ${showRequests ? "rotate-180" : "rotate-0"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {showRequests && (
                            <div className="overflow-x-auto transition-all duration-200">
                                <table className="min-w-full text-sm">
                                    <thead>
                                        <tr className="text-slate-500 text-xs tracking-wider">
                                            <th className="py-3 text-left">Employee</th>
                                            <th className="py-3 text-left">Period</th>
                                            <th className="py-3 text-left">Days</th>
                                            <th className="py-3 text-left">Status</th>
                                            <th className="py-3 text-left">Actions</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {requests.length === 0 && (
                                            <tr>
                                                <td colSpan={5} className="py-12 text-center text-slate-400">
                                                    <div className="flex flex-col items-center gap-3">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3M3 11h18M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                        <div>No leave requests.</div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}

                                        {requests.map((req) => (
                                            <tr key={req.id} className="border-t">
                                                <td className="py-3">{req.email}</td>
                                                <td className="py-3">
                                                    {req.start_date} → {req.end_date}
                                                </td>
                                                <td className="py-3">{req.days}</td>
                                                <td className="py-3 font-semibold">{
                                                    req.status === "APPROVED" ? (
                                                        <span className="text-emerald-600">Approved</span>
                                                    ) : req.status === "DECLINED" ? (
                                                        <span className="text-rose-500">Declined</span>
                                                    ) : (
                                                        <span className="text-yellow-600">Pending</span>
                                                    )
                                                }</td>
                                                <td className="py-3">
                                                    <div className="flex gap-2">
                                                        {req.status === "PENDING" && (
                                                            <>
                                                                <button onClick={() => updateRequestStatus(req.id, "APPROVED")} className="px-3 py-1 rounded-md bg-emerald-600 text-white text-sm">Approve</button>
                                                                <button onClick={() => updateRequestStatus(req.id, "DECLINED")} className="px-3 py-1 rounded-md bg-rose-500 text-white text-sm">Decline</button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </main>
            <AddEmployee
                isOpen={showAddEmployee}
                onClose={() => setShowAddEmployee(false)}
                onSuccess={() => {
                    fetchEmployees();
                    showToast("Employee added successfully");
                }}
            />

            {/* Toast */}
            {toast && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-black text-white px-6 py-3 rounded-full shadow-lg">
                    {toast}
                </div>
            )}
        </div>
    );
}

// ---------- Reusable small components ----------
function StatCard({ title, value, icon, accent }: { title: string; value: number; icon: string; accent?: string; }) {
    const accentClass = accent === "emerald" ? "bg-emerald-50 text-emerald-600" : accent === "rose" ? "bg-rose-50 text-rose-600" : "bg-sky-50 text-sky-600";

    return (
        <div className={`rounded-2xl p-4 shadow-sm bg-white flex items-center justify-between border`}>
            <div>
                <div className="text-sm text-slate-400">{title}</div>
                <div className="mt-2 text-2xl font-bold">{value}</div>
            </div>

            <div className={`p-3 rounded-lg ${accentClass}`}>
                {icon === "users" && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87M16 11a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                )}

                {icon === "clock" && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                )}

                {icon === "check" && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                )}

                {icon === "x" && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                )}
            </div>
        </div>
    );
}