const express = require("express");
const router = express.Router();

const { getAllUsers, getUsersById, createUser, loginUser, updateUser, deleteUser } = require("../controllers/usersController");
const { verifyToken } = require("../middleware/auth");

router.get("/", verifyToken, getAllUsers);
router.post("/register", createUser);
router.get("/:id", verifyToken, getUsersById);   // ← ADD THIS
router.post("/login", loginUser);
router.patch("/:user_id", verifyToken, updateUser);
router.delete("/:user_id", verifyToken, deleteUser);

module.exports = router;