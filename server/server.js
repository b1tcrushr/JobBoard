require("dotenv").config();
const express = require("express");
const app = express();

const PORT = 3000;

app.use(express.json());

const usersRoutes = require("./routes/users");

//Routes
app.use("/users", usersRoutes);

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});