const express = require("express");
const router = express.Router();

const {
    createEmployee,
    getEmployees,
    deleteEmployee
} = require("../controllers/adminController");

const authMiddleware = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

router.post("/employees", authMiddleware, adminOnly, createEmployee);
router.get("/employees", authMiddleware, adminOnly, getEmployees);
router.delete("/employees/:userId", authMiddleware, adminOnly, deleteEmployee);

module.exports = router;
