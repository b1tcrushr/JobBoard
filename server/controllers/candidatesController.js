const db = require("../db");

async function getAllCandidates(req, res) {
    try {
        const [rows] = await db.query("SELECT candidate_id, user_id, email, name, employed FROM candidates");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function getCandidateById(req, res) {
    try {
        const [rows] = await db.query(
            "SELECT candidate_id, user_id, email, name, employed FROM candidates WHERE candidate_id = ?",
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

module.exports = { getAllCandidates, getCandidateById };
