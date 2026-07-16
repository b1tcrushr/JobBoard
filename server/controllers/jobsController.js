const db = require("../db");

async function getAllJobs(req, res) {
    try {
        const [rows] = await db.query(
            `SELECT j.job_id, j.employer_id, j.company_id, j.job_title, j.job_location, j.work_type, j.job_type, j.job_description, j.job_status, c.company_name
             FROM job_postings j
             JOIN companies c ON j.company_id = c.company_id
             WHERE j.job_status != 'closed'`
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
async function getJobByEmployer(req, res) {
    const { employer_id } = req.body;
    if (!employer_id) {
        return res.status(400).json({ error: "job_id is required" });
    }

    try {
        const [rows] = await db.query(
            "SELECT job_id, employer_id, company_id, job_title, job_location, work_type, job_type, job_description, job_status FROM job_postings WHERE employer_id = ? AND job_status != 'closed'",
            [employer_id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ error: "Job not found" });
        }

        res.json(rows);
    }
    catch (err) {
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
            "SELECT job_id, employer_id, company_id, job_title, job_location, work_type, job_type, job_description, job_status FROM job_postings WHERE job_id = ? AND job_status != 'closed'",
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
async function closeJobById(req, res) {
    const { job_id } = req.params;
    if (!job_id) {
        return res.status(400).json({ error: "Job Id required" });
    }
    try {
        const [result] = await db.query(
            "UPDATE job_postings SET job_status = 'closed' WHERE job_id = ?",
            [job_id]
        );


        res.json({ job_id, job_status: "closed" });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function updateJobById(req, res) {
    const { job_id } = req.params;
    const { title, location, jobType, workType, description, status } = req.body;

    if (!title || !workType || !jobType || !description || !status) {
        return res.status(400).json({ error: "title, workType, jobType, description, and status are required" });
    }

    try {
        const [result] = await db.query(
            "UPDATE job_postings SET job_title = ?, job_location = ?, work_type = ?, job_type = ?, job_description = ?, job_status = ? WHERE job_id = ?",
            [title, location, workType, jobType, description, status, job_id]
        );


        res.json({ job_id, title, location, workType, jobType, description, status });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

module.exports = { getAllJobs, getJobByEmployer, getJobById, createJob, updateJobById, closeJobById };