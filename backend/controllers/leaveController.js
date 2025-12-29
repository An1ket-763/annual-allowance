const db = require("../db");

// ---------------- EMPLOYEE: CREATE LEAVE ----------------
exports.createLeaveRequest = async (req, res) => {
    try {
        const user = req.user;
        const { startDate, endDate, days } = req.body;

        if (!startDate || !endDate || !days) {
            return res.status(400).json({ message: "Missing fields" });
        }

        await db.query(
            `INSERT INTO leave_requests
             (employee_user_id, department, start_date, end_date, days)
             VALUES (?, ?, ?, ?, ?)`,
            [user.id, user.department, startDate, endDate, days]
        );

        res.status(201).json({ message: "Leave request submitted" });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ---------------- ADMIN: VIEW LEAVES ----------------
exports.getAdminLeaveRequests = async (req, res) => {
    try {
        const admin = req.user;

        const [rows] = await db.query(
            `SELECT 
                lr.id,
                u.email,
                lr.start_date,
                lr.end_date,
                lr.days,
                lr.status
             FROM leave_requests lr
             JOIN users u ON lr.employee_user_id = u.id
             WHERE lr.department = ?
             ORDER BY lr.created_at DESC`,
            [admin.department]
        );

        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ---------------- ADMIN: APPROVE / DECLINE ----------------
exports.decideLeaveRequest = async (req, res) => {
    try {
        const admin = req.user;
        const { status } = req.body; // APPROVED or DECLINED
        const leaveId = req.params.id;

        if (!["APPROVED", "DECLINED"].includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        const [[leave]] = await db.query(
            "SELECT * FROM leave_requests WHERE id = ?",
            [leaveId]
        );

        if (!leave) {
            return res.status(404).json({ message: "Leave not found" });
        }

        if (leave.department !== admin.department) {
            return res.status(403).json({ message: "Forbidden" });
        }

        await db.query(
            `UPDATE leave_requests
             SET status = ?, decided_by_admin_id = ?, decided_at = NOW()
             WHERE id = ?`,
            [status, admin.id, leaveId]
        );

        // Update leave balance ONLY if approved
        if (status === "APPROVED") {
            await db.query(
                `UPDATE employees
                 SET used_leaves = used_leaves + ?,
                     remaining_leaves = remaining_leaves - ?
                 WHERE user_id = ?`,
                [leave.days, leave.days, leave.employee_user_id]
            );
        }

        res.json({ message: `Leave ${status.toLowerCase()}` });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ---------------- EMPLOYEE: VIEW MY LEAVES ----------------
exports.getMyLeaveRequests = async (req, res) => {
    try {
        const user = req.user;

        const [rows] = await db.query(
            `SELECT 
                id,
                start_date,
                end_date,
                days,
                status
             FROM leave_requests
             WHERE employee_user_id = ?
             ORDER BY created_at DESC`,
            [user.id]
        );

        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

