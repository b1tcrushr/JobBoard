const db = require("../db");

async function getAllEmployers(req, res) {
    try {
        const [rows] = await db.query("SELECT employer_id, user_id, company_id, email, name FROM employers");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function getEmployerById(req, res) {
    try {
        const [rows] = await db.query(
            "SELECT employer_id, user_id, company_id, email, name FROM employers WHERE employer_id = ?",
            [req.params.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: "Employer not found" });
        }

        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

module.exports = { getAllEmployers, getEmployerById };
