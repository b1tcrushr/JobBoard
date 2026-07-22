const db = require("../db");

async function getAllEmployers(req, res) {
    try {
        const [rows] = await db.query(
            `SELECT e.employer_id, e.user_id, e.company_id, e.email, e.name, c.company_name
             FROM employers e
             JOIN companies c ON e.company_id = c.company_id
             JOIN users u ON e.user_id = u.user_id
             WHERE LOWER(u.role) = 'employer'`
        );
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

async function getEmployerByUserId(req, res) {
    try {
        const [rows] = await db.query(
            `SELECT e.employer_id, e.user_id, e.company_id, e.email, e.name,
                    c.company_name, c.industry, c.headquarters_location, c.company_size, c.company_website, c.company_description
             FROM employers e
             JOIN companies c ON e.company_id = c.company_id
             WHERE e.user_id = ?`,
            [req.params.user_id]
        );

        if (rows.length === 0) {
            const [uRows] = await db.query("SELECT user_id, name, email, role FROM users WHERE user_id = ?", [req.params.user_id]);
            if (uRows.length > 0 && uRows[0].role === 'employer') {
                const user = uRows[0];
                const companyName = `${user.name}'s Company`;
                const [compRes] = await db.query("INSERT INTO companies (company_name) VALUES (?)", [companyName]);
                await db.query("INSERT INTO employers (user_id, company_id, email, name) VALUES (?, ?, ?, ?)", [user.user_id, compRes.insertId, user.email, user.name]);

                const [createdRows] = await db.query(
                    `SELECT e.employer_id, e.user_id, e.company_id, e.email, e.name,
                            c.company_name, c.industry, c.headquarters_location, c.company_size, c.company_website, c.company_description
                     FROM employers e
                     JOIN companies c ON e.company_id = c.company_id
                     WHERE e.user_id = ?`,
                    [req.params.user_id]
                );
                if (createdRows.length > 0) {
                    return res.json(createdRows[0]);
                }
            }
            return res.status(404).json({ error: "Employer not found" });
        }

        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function updateEmployerByUserId(req, res) {
    const { user_id } = req.params;
    const { company_name, industry, company_size, company_website, company_description, headquarters_location, name, email } = req.body;

    try {
        const [empRows] = await db.query("SELECT employer_id, company_id FROM employers WHERE user_id = ?", [user_id]);
        if (empRows.length === 0) {
            return res.status(404).json({ error: "Employer not found" });
        }

        const company_id = empRows[0].company_id;

        // Update company details
        await db.query(
            `UPDATE companies 
             SET company_name = COALESCE(?, company_name),
                 industry = COALESCE(?, industry),
                 company_size = COALESCE(?, company_size),
                 company_website = COALESCE(?, company_website),
                 company_description = COALESCE(?, company_description),
                 headquarters_location = COALESCE(?, headquarters_location)
             WHERE company_id = ?`,
            [company_name, industry, company_size, company_website, company_description, headquarters_location, company_id]
        );

        if (name || email) {
            await db.query(
                `UPDATE employers SET name = COALESCE(?, name), email = COALESCE(?, email) WHERE user_id = ?`,
                [name, email, user_id]
            );
            await db.query(
                `UPDATE candidates SET name = COALESCE(?, name), email = COALESCE(?, email) WHERE user_id = ?`,
                [name, email, user_id]
            );
            await db.query(
                `UPDATE users SET name = COALESCE(?, name), email = COALESCE(?, email) WHERE user_id = ?`,
                [name, email, user_id]
            );
        }

        res.json({ message: "Employer profile updated successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

module.exports = { getAllEmployers, getEmployerById, getEmployerByUserId, updateEmployerByUserId };
