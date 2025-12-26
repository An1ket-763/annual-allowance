const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
    res.json({
        message: "Backend server running 🚀",
        status: "OK"
    });
});

module.exports = router;
