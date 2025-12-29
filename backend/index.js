const express = require("express");
const cors = require("cors");
require("dotenv").config();

const testRoutes = require("./routes/testRoutes");
const dbTestRoutes = require("./routes/dbTestRoutes");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const leaveRoutes = require("./routes/leaveRoutes");
const employeeRoutes = require("./routes/employeeRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/", testRoutes);
app.use("/", dbTestRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/employees", employeeRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
});
