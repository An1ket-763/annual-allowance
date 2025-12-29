const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");
const {
    createLeaveRequest,
    getAdminLeaveRequests,
    decideLeaveRequest,
    getMyLeaveRequests
} = require("../controllers/leaveController");


// Employee
router.post("/", authMiddleware, createLeaveRequest);
router.get("/", authMiddleware, getMyLeaveRequests);

// Admin
router.get("/admin", authMiddleware, adminOnly, getAdminLeaveRequests);
router.put("/admin/:id", authMiddleware, adminOnly, decideLeaveRequest);

module.exports = router;
