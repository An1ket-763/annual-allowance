const db = require("../db");

// ---------------- EMPLOYEE: CREATE LEAVE ----------------
exports.createLeaveRequest = async (req, res) => {
    try {
        const user = req.user;

        const { startDate, endDate } = req.body;

        const start = new Date(startDate);
        const end = new Date(endDate);

        if (isNaN(start) || isNaN(end) || end < start) {
            return res.status(400).json({ message: "Invalid date range" });
        }

        const days =
            Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;

        if (!startDate || !endDate) {
            return res.status(400).json({ message: "Missing fields" });
        }

        // 1️⃣ Fetch employee leave balance
        const [[employee]] = await db.query(
            `SELECT remaining_leaves 
             FROM employees 
             WHERE user_id = ?`,
            [user.id]
        );

        if (!employee) {
            return res.status(404).json({ message: "Employee not found" });
        }

        // 2️⃣ Block if no remaining leaves
        if (employee.remaining_leaves <= 0) {
            return res.status(400).json({
                message: "You have no remaining leaves"
            });
        }

        // 3️⃣ Block if requesting more than remaining
        if (days > employee.remaining_leaves) {
            return res.status(400).json({
                message: `You can only request up to ${employee.remaining_leaves} days`
            });
        }

        // 4️⃣ Insert leave request
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
    const connection = await db.getConnection();

    try {
        const admin = req.user;
        const { status } = req.body;
        const leaveId = req.params.id;

        if (!["APPROVED", "DECLINED"].includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        await connection.beginTransaction();

        // 1️⃣ Fetch leave request (lock row)
        const [[leave]] = await connection.query(
            `SELECT * 
             FROM leave_requests 
             WHERE id = ? 
             FOR UPDATE`,
            [leaveId]
        );

        if (!leave) {
            await connection.rollback();
            return res.status(404).json({ message: "Leave not found" });
        }

        if (leave.department !== admin.department) {
            await connection.rollback();
            return res.status(403).json({ message: "Forbidden" });
        }

        if (leave.status !== "PENDING") {
            await connection.rollback();
            return res.status(400).json({ message: "Leave already decided" });
        }

        // 2️⃣ If approving → re-check balance
        if (status === "APPROVED") {
            const [[employee]] = await connection.query(
                `SELECT remaining_leaves 
                 FROM employees 
                 WHERE user_id = ? 
                 FOR UPDATE`,
                [leave.employee_user_id]
            );

            if (!employee) {
                await connection.rollback();
                return res.status(404).json({ message: "Employee not found" });
            }

            if (leave.days > employee.remaining_leaves) {
                await connection.rollback();
                return res.status(400).json({
                    message: "Cannot approve. Employee does not have enough remaining leaves."
                });
            }

            // Deduct leaves
            await connection.query(
                `UPDATE employees
                 SET used_leaves = used_leaves + ?,
                     remaining_leaves = remaining_leaves - ?
                 WHERE user_id = ?`,
                [leave.days, leave.days, leave.employee_user_id]
            );
        }

        // 3️⃣ Update leave status
        await connection.query(
            `UPDATE leave_requests
             SET status = ?, decided_by_admin_id = ?, decided_at = NOW()
             WHERE id = ?`,
            [status, admin.id, leaveId]
        );

        await connection.commit();
        res.json({ message: `Leave ${status.toLowerCase()}` });

    } catch (err) {
        await connection.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        connection.release();
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

