const db = require("../db");

async function getAllCompanies(req, res) {
    try {
        const [rows] = await db.query("SELECT company_id, company_name, industry, headquarters_location FROM companies");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function getCompanyById(req, res) {
    try {
        const [rows] = await db.query(
            "SELECT company_id, company_name, industry, headquarters_location FROM companies WHERE company_id = ?",
            [req.params.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: "Company not found" });
        }

        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

module.exports = { getAllCompanies, getCompanyById };
