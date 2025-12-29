const db = require("../db");
const bcrypt = require("bcryptjs");

// -------------------- CREATE EMPLOYEE --------------------
exports.createEmployee = async (req, res) => {
    const { email, password } = req.body;
    const admin = req.user;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password required" });
    }

    const conn = await db.getConnection();

    try {
        // Check if user already exists
        const [existing] = await conn.query(
            "SELECT id FROM users WHERE email = ?",
            [email]
        );

        if (existing.length > 0) {
            conn.release();
            return res.status(409).json({ message: "User already exists" });
        }

        // Get EMPLOYEE role id
        const [[roleRow]] = await conn.query(
            "SELECT id FROM roles WHERE name = 'EMPLOYEE'"
        );

        const hashedPassword = await bcrypt.hash(password, 10);

        await conn.beginTransaction();

        // Insert into users
        const [userResult] = await conn.query(
            `INSERT INTO users 
             (email, password_hash, role_id, department, must_change_password)
             VALUES (?, ?, ?, ?, true)`,
            [email, hashedPassword, roleRow.id, admin.department]
        );

        const userId = userResult.insertId;

        // Insert into employees
        await conn.query(
            `INSERT INTO employees
             (user_id, department, total_leaves, used_leaves, remaining_leaves, created_by_admin_id)
             VALUES (?, ?, 30, 0, 30, ?)`,
            [userId, admin.department, admin.id]
        );

        await conn.commit();

        res.status(201).json({ message: "Employee created successfully" });

    } catch (err) {
        await conn.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        conn.release();
    }
};

// -------------------- GET EMPLOYEES (ADMIN) --------------------
exports.getEmployees = async (req, res) => {
    try {
        const admin = req.user;

        const [rows] = await db.query(
            `SELECT 
                u.id AS user_id,
                u.email,
                e.total_leaves,
                e.used_leaves,
                e.remaining_leaves
             FROM employees e
             JOIN users u ON e.user_id = u.id
             WHERE e.department = ?`,
            [admin.department]
        );

        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


exports.deleteEmployee = async (req, res) => {
    try {
        const admin = req.user;
        const { userId } = req.params;

        // Ensure same department
        const [[emp]] = await db.query(
            `SELECT department FROM employees WHERE user_id = ?`,
            [userId]
        );

        if (!emp || emp.department !== admin.department) {
            return res.status(403).json({ message: "Forbidden" });
        }

        // Delete user (cascades to employees & leaves)
        await db.query(`DELETE FROM users WHERE id = ?`, [userId]);

        res.json({ message: "Employee removed" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
