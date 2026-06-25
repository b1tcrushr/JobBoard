const db = require("../db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

async function getAllJobs(req, res) {
    try {
        const [rows] = await db.query("SELECT job_id, employer_id, company_id, job_title, job_location, job_description, job_status FROM job_postings");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

module.exports = { getAllJobs };