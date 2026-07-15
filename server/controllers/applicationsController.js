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

module.exports = { createApplication };