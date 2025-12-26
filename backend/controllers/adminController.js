const db = require("../db");
const bcrypt = require("bcryptjs");

// -------------------- CREATE EMPLOYEE --------------------
exports.createEmployee = async (req, res) => {
    try {
        const { email, password } = req.body;
        const admin = req.user; // from JWT

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password required" });
        }

        // Check if user already exists
        const [existing] = await db.query(
            "SELECT id FROM users WHERE email = ?",
            [email]
        );

        if (existing.length > 0) {
            return res.status(409).json({ message: "User already exists" });
        }

        // Get EMPLOYEE role id
        const [[roleRow]] = await db.query(
            "SELECT id FROM roles WHERE name = 'EMPLOYEE'"
        );

        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert into users
        const [userResult] = await db.query(
            `INSERT INTO users (email, password_hash, role_id, department)
             VALUES (?, ?, ?, ?)`,
            [email, hashedPassword, roleRow.id, admin.department]
        );

        const userId = userResult.insertId;

        // Insert into employees
        await db.query(
            `INSERT INTO employees (user_id, department, created_by_admin_id)
             VALUES (?, ?, ?)`,
            [userId, admin.department, admin.id]
        );

        res.status(201).json({ message: "Employee created successfully" });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// -------------------- GET EMPLOYEES (ADMIN) --------------------
exports.getEmployees = async (req, res) => {
    try {
        const admin = req.user;

        const [rows] = await db.query(
            `SELECT 
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
