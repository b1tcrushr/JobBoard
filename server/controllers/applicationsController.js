const db = require("../db");

async function createApplication(req, res) {
    const { job_id, company_id, candidate_id } = req.body;

    if (!job_id || !company_id || !candidate_id) {
        return res.status(400).json({ error: "job_id, company_id, and candidate_id are required" });
    }

    try {

        const [result] = await db.query(
            "INSERT INTO applications (job_id, company_id, candidate_id) VALUES (?, ?, ?)",
            [job_id, company_id, candidate_id]
        );

        res.status(201).json({
            app_id: result.insertId,
            job_id,
            company_id,
            candidate_id,
            status: "applied"
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
async function getAllApplicationsByJob(req, res) {
    const { job_id } = req.params;

    try {
        const [rows] = await db.query(
            `SELECT a.app_id, a.job_id, a.company_id, a.candidate_id, a.status, c.name, c.email
             FROM applications a
             JOIN candidates c ON a.candidate_id = c.candidate_id
             WHERE a.job_id = ?`,
            [job_id]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
async function getAllApplicationsByUser(req, res) {
    const { user_id } = req.params;
    try {
        const [rows] = await db.query(
            `SELECT a.app_id, a.job_id, a.company_id, a.candidate_id, a.status, c.name, c.email
            FROM applications a
            JOIN candidates c ON a.candidate_id = c.candidate_id
            WHERE c.user_id = ?`,
            [user_id]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
async function updateApplication(req, res) {
    const { app_id } = req.params;
    const { status } = req.body;

    if (!status) {
        return res.status(400).json({ error: "status is required" });
    }

    try {
        const [result] = await db.query(
            "UPDATE applications SET status = ? WHERE app_id = ?",
            [status, app_id]
        );
        
        res.json({ app_id, status });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

module.exports = { createApplication, getAllApplicationsByJob, getAllApplicationsByUser, updateApplication };