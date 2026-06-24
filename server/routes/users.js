const express = require("express");
const router = express.Router();

//controller functions
const { getAllUsers } = require("../controllers/usersController");

//get request to get all users
router.get("/", (req, res) => {
    res.send("all users"); //example
});

module.exports = router;