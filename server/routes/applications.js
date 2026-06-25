const express = require("express");
const router = express.Router();

const { createApplication } = require("../controllers/applicationsController");
const { verifyToken } = require("../middleware/auth");

router.post("/create", createApplication);


module.exports = router;
