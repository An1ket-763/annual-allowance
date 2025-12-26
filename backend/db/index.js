const mysql = require("mysql2/promise");

const db = mysql.createPool({
    host: "localhost",
    user: "aniket",
    password: "aniket763",
    database: "leavetracker"
});

module.exports = db;

