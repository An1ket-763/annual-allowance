const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

const { getMyLeaveBalance } = require("../controllers/employeeController");

router.get("/me", authMiddleware, getMyLeaveBalance);

module.exports = router;
