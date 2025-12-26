const express = require("express");
const router = express.Router();
const { testDb } = require("../controllers/dbTestController");

router.get("/db-test", testDb);

module.exports = router;
