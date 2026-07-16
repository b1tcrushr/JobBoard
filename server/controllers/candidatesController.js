const db = require("../db");

async function getAllCandidates(req, res) {
    try {
        const [rows] = await db.query("SELECT candidate_id, user_id, email, name, employed, applications_sent, interviews_scheduled, not_selected FROM candidates");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function getCandidateById(req, res) {
    try {
        const [rows] = await db.query(
            "SELECT candidate_id, user_id, email, name, employed, applications_sent, interviews_scheduled, not_selected FROM candidates WHERE candidate_id = ?",
            [req.params.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: "Candidate not found" });
        }

        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function getCandidateByUserId(req, res) {
    try {
        const [rows] = await db.query(
            "SELECT candidate_id, user_id, email, name, employed, applications_sent, interviews_scheduled, not_selected FROM candidates WHERE user_id = ?",
            [req.params.user_id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: "Candidate not found" });
        }

        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

module.exports = { getAllCandidates, getCandidateById, getCandidateByUserId };
