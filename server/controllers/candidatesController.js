const db = require("../db");

async function getAllCandidates(req, res) {
    try {
        const [rows] = await db.query(
            `SELECT c.candidate_id, c.user_id, c.email, c.name,
                    COUNT(a.app_id) AS applications_sent,
                    SUM(CASE WHEN LOWER(a.status) IN ('interview', 'accepted') THEN 1 ELSE 0 END) AS interviews_scheduled,
                    SUM(CASE WHEN LOWER(a.status) = 'rejected' THEN 1 ELSE 0 END) AS not_selected
             FROM candidates c
             JOIN users u ON c.user_id = u.user_id
             LEFT JOIN applications a ON c.candidate_id = a.candidate_id
             WHERE LOWER(u.role) = 'candidate'
             GROUP BY c.candidate_id`
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function getCandidateById(req, res) {
    try {
        const [rows] = await db.query(
            `SELECT c.candidate_id, c.user_id, c.email, c.name,
                    COUNT(a.app_id) AS applications_sent,
                    SUM(CASE WHEN LOWER(a.status) IN ('interview', 'accepted') THEN 1 ELSE 0 END) AS interviews_scheduled,
                    SUM(CASE WHEN LOWER(a.status) = 'rejected' THEN 1 ELSE 0 END) AS not_selected
             FROM candidates c
             LEFT JOIN applications a ON c.candidate_id = a.candidate_id
             WHERE c.candidate_id = ?
             GROUP BY c.candidate_id`,
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
            "SELECT candidate_id, user_id, email, name FROM candidates WHERE user_id = ?",
            [req.params.user_id]
        );

        if (rows.length === 0) {
            const [uRows] = await db.query("SELECT user_id, name, email, role FROM users WHERE user_id = ?", [req.params.user_id]);
            if (uRows.length > 0 && (uRows[0].role === 'candidate' || uRows[0].role === 'admin')) {
                const user = uRows[0];
                await db.query("INSERT INTO candidates (user_id, email, name) VALUES (?, ?, ?)", [user.user_id, user.email, user.name]);
                const [createdRows] = await db.query("SELECT candidate_id, user_id, email, name FROM candidates WHERE user_id = ?", [req.params.user_id]);
                if (createdRows.length > 0) {
                    const candidate = createdRows[0];
                    candidate.applications_sent = 0;
                    candidate.interviews_scheduled = 0;
                    candidate.not_selected = 0;
                    return res.json(candidate);
                }
            }
            return res.status(404).json({ error: "Candidate not found" });
        }

        const candidate = rows[0];

        const [stats] = await db.query(
            `SELECT 
                COUNT(*) AS applications_sent,
                SUM(CASE WHEN LOWER(status) IN ('interview', 'accepted') THEN 1 ELSE 0 END) AS interviews_scheduled,
                SUM(CASE WHEN LOWER(status) = 'rejected' THEN 1 ELSE 0 END) AS not_selected
             FROM applications 
             WHERE candidate_id = ?`,
            [candidate.candidate_id]
        );

        const realStats = stats[0] || {};
        candidate.applications_sent = Number(realStats.applications_sent || 0);
        candidate.interviews_scheduled = Number(realStats.interviews_scheduled || 0);
        candidate.not_selected = Number(realStats.not_selected || 0);

        res.json(candidate);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

module.exports = { getAllCandidates, getCandidateById, getCandidateByUserId };
