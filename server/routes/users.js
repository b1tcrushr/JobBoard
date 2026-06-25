const express = require("express");
const router = express.Router();

const { getAllUsers, createUser, loginUser } = require("../controllers/usersController");
const { verifyToken } = require("../middleware/auth");

router.get("/", verifyToken, getAllUsers);
router.post("/register", createUser);
router.post("/login", loginUser);

module.exports = router;
