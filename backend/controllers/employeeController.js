const db = require("../db");

exports.getMyLeaveBalance = async (req, res) => {
    try {
        const user = req.user;

        const [[employee]] = await db.query(
            `SELECT total_leaves, used_leaves, remaining_leaves
             FROM employees
             WHERE user_id = ?`,
            [user.id]
        );

        if (!employee) {
            return res.status(404).json({ message: "Employee record not found" });
        }

        res.json(employee);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
