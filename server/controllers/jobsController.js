const db = require("../db");

async function getAllJobs(req, res) {
    try {
        const [rows] = await db.query("SELECT job_id, employer_id, company_id, job_title, job_location, job_description, job_status FROM job_postings");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function getJobById(req, res) {
    const { job_id } = req.body;

    if (!job_id) {
        return res.status(400).json({ error: "job_id is required" });
    }

    try {
        const [rows] = await db.query(
            "SELECT job_id, employer_id, company_id, job_title, job_location, work_type, job_type, job_description, job_status FROM job_postings WHERE job_id = ?",
            [job_id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: "Job not found" });
        }

        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function createJob(req, res) {
    const { employer_id, company_id, job_title, job_location, work_type, job_type, job_description, job_status } = req.body;

    if (!employer_id || !company_id || !job_title || !work_type || !job_type || !job_description || !job_status) {
        return res.status(400).json({ error: "employer_id, company_id, job_title, work_type, job_type, job_description, and job_status are required" });
    }

    try {
        const [result] = await db.query(
            "INSERT INTO job_postings (employer_id, company_id, job_title, job_location, work_type, job_type, job_description, job_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            [employer_id, company_id, job_title, job_location, work_type, job_type, job_description, job_status]
        );

        res.status(201).json({
            job_id: result.insertId,
            employer_id,
            company_id,
            job_title,
            job_location,
            work_type,
            job_type,
            job_description,
            job_status
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

module.exports = { getAllJobs, getJobById, createJob };