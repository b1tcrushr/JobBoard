const express = require("express");
const router = express.Router();

const { getAllUsers, createUser, loginUser, updateUser } = require("../controllers/usersController");
const { verifyToken } = require("../middleware/auth");

router.get("/", verifyToken, getAllUsers);
router.post("/register", createUser);
router.post("/login", loginUser);
router.patch("/:user_id", verifyToken, updateUser);

module.exports = router;
