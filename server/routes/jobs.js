const express = require("express");
const router = express.Router();

const { getAllJobs, getJobByEmployer, getJobById, createJob, updateJobById, closeJobById } = require("../controllers/jobsController");
const { verifyToken } = require("../middleware/auth");

router.get("/", verifyToken, getAllJobs);
router.post("/employer", getJobByEmployer);
router.post("/get", getJobById);
router.post("/create", createJob);
router.patch("/:job_id", updateJobById);
router.delete("/:job_id", closeJobById);

module.exports = router;
