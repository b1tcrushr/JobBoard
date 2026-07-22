const express = require("express");
const router = express.Router();

const { getAllJobs, getJobByEmployer, getJobById, createJob, updateJobById, closeJobById, reopenJobById, getJobStats } = require("../controllers/jobsController");
const { verifyToken } = require("../middleware/auth");

router.get("/", getAllJobs);
router.get("/stats", getJobStats);
router.post("/employer", getJobByEmployer);
router.get("/employer/:employer_id", getJobByEmployer);
router.get("/:id", getJobById);
router.post("/get", getJobById);
router.post("/create", verifyToken, createJob);
router.patch("/:job_id/reopen", verifyToken, reopenJobById);
router.patch("/:job_id", verifyToken, updateJobById);
router.delete("/:job_id", verifyToken, closeJobById);

module.exports = router;
