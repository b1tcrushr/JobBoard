const express = require("express");
const router = express.Router();

const { getAllJobs, getJobByEmployer, getJobById, createJob, updateJobById, closeJobById, reopenJobById } = require("../controllers/jobsController");
const { verifyToken } = require("../middleware/auth");

router.get("/", getAllJobs);
router.post("/employer", getJobByEmployer);
router.get("/employer/:employer_id", getJobByEmployer);
router.post("/get", getJobById);
router.post("/create", createJob);
router.patch("/:job_id/reopen", reopenJobById);
router.patch("/:job_id", updateJobById);
router.delete("/:job_id", closeJobById);

module.exports = router;
