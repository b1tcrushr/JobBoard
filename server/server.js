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

//Routes
app.use("/users", usersRoutes);
app.use("/jobs", jobsRoutes);
app.use("/applications", applicationsRoutes);

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});