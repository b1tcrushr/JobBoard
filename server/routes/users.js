const express = require("express");
const router = express.Router();

const { getAllUsers, getUsersById, createUser, loginUser, updateUser, deleteUser, checkAdminExists } = require("../controllers/usersController");
const { verifyToken, optionalVerifyToken } = require("../middleware/auth");

router.get("/", verifyToken, getAllUsers);
router.get("/admin-exists", checkAdminExists);
router.post("/register", optionalVerifyToken, createUser);
router.get("/:id", verifyToken, getUsersById);
router.post("/login", loginUser);
router.patch("/:user_id", verifyToken, updateUser);
router.delete("/:user_id", verifyToken, deleteUser);

module.exports = router;