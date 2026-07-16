const express = require("express");
const router = express.Router();

const { getAllCandidates, getCandidateById, getCandidateByUserId } = require("../controllers/candidatesController");

router.get("/", getAllCandidates);
router.get("/user/:user_id", getCandidateByUserId);
router.get("/:id", getCandidateById);

module.exports = router;
