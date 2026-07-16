const express = require("express");
const router = express.Router();

const {
    createApplication,
    getAllApplicationsByJob,
    getAllApplicationsByUser,
    updateApplication
} = require("../controllers/applicationsController");
const { verifyToken } = require("../middleware/auth");

router.post("/create", createApplication);
router.get("/job/:job_id", getAllApplicationsByJob);
router.get("/user/:user_id", getAllApplicationsByUser);
router.patch("/:app_id", updateApplication);

module.exports = router;
