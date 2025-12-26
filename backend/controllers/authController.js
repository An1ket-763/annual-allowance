const db = require("../db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password required" });
        }

        const [rows] = await db.query(
            `SELECT users.id, users.email, users.password_hash, users.department, roles.name AS role
             FROM users
             JOIN roles ON users.role_id = roles.id
             WHERE users.email = ?`,
            [email]
        );

        if (rows.length === 0) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const user = rows[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const token = jwt.sign(
            {
                id: user.id,
                role: user.role,
                department: user.department
            },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.json({
            token,
            role: user.role,
            department: user.department
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
    console.log(req.user);
};
