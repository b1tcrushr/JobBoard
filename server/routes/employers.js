const express = require("express");
const router = express.Router();

const { getAllEmployers, getEmployerById } = require("../controllers/employersController");

router.get("/", getAllEmployers);
router.get("/:id", getEmployerById);

module.exports = router;
