const express = require("express");
const router = express.Router();

const { getAllCompanies, getCompanyById } = require("../controllers/companiesController");

router.get("/", getAllCompanies);
router.get("/:id", getCompanyById);

module.exports = router;
