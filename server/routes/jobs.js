const express = require("express");
const router = express.Router();

const { getAllJobs, getJobById, createJob } = require("../controllers/jobsController");
const { verifyToken } = require("../middleware/auth");

router.get("/", verifyToken, getAllJobs);
router.post("/get", getJobById);
router.post("/create", createJob);

module.exports = router;
