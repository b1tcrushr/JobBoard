const express = require("express");
const router = express.Router();

const {
    createApplication,
    getAllApplicationsByJob,
    getAllApplicationsByUser,
    getAllApplicationsByEmployer,
    updateApplication
} = require("../controllers/applicationsController");
const { verifyToken } = require("../middleware/auth");

router.post("/create", verifyToken, createApplication);
router.get("/job/:job_id", getAllApplicationsByJob);
router.get("/user/:user_id", getAllApplicationsByUser);
router.get("/employer/:employer_id", getAllApplicationsByEmployer);
router.patch("/:app_id", verifyToken, updateApplication);

module.exports = router;
