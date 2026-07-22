const express = require("express");
const router = express.Router();

const { getAllEmployers, getEmployerById, getEmployerByUserId, updateEmployerByUserId } = require("../controllers/employersController");

router.get("/", getAllEmployers);
router.get("/user/:user_id", getEmployerByUserId);
router.patch("/user/:user_id", updateEmployerByUserId);
router.get("/:id", getEmployerById);

module.exports = router;
