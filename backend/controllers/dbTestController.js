const db = require("../db");

exports.testDb = async (req, res) => {
    try {
        const [rows] = await db.query("SELECT 1 + 1 AS result");
        res.json({ result: rows[0].result });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
