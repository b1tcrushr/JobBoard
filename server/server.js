require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();

const PORT = 3000;

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

const usersRoutes = require("./routes/users");
const jobsRoutes = require("./routes/jobs");
const applicationsRoutes = require("./routes/applications");
const candidatesRoutes = require("./routes/candidates");
const employersRoutes = require("./routes/employers");
const companiesRoutes = require("./routes/companies");

//Routes
app.use("/api/users", usersRoutes);
app.use("/api/jobs", jobsRoutes);
app.use("/api/applications", applicationsRoutes);
app.use("/api/candidates", candidatesRoutes);
app.use("/api/employers", employersRoutes);
app.use("/api/companies", companiesRoutes);

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});