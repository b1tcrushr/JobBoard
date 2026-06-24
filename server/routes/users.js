const express = require("express");
const router = express.Router();

const { getAllUsers, createUser } = require("../controllers/usersController");
const { verifyToken } = require("../middleware/auth");

router.get("/", verifyToken, getAllUsers);
router.post("/", createUser);

module.exports = router;
