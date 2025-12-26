const express = require("express");
const router = express.Router();
const { createEmployee, getEmployees } = require("../controllers/adminController");
const authMiddleware = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

router.post("/employees", authMiddleware, adminOnly, createEmployee);
router.get("/employees", authMiddleware, adminOnly, getEmployees);

module.exports = router;
