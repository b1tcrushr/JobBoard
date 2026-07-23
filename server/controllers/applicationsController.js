const db = require("../db");

async function createApplication(req, res) {
    let { job_id, company_id, candidate_id, user_id, resume_text, cover_letter } = req.body;

    try {
        if (!job_id) {
            return res.status(400).json({ error: "job_id is required" });
        }

        // Look up candidate_id if missing but user_id is provided
        if (!candidate_id && user_id) {
            const [candRows] = await db.query(
                "SELECT candidate_id FROM candidates WHERE user_id = ?",
                [user_id]
            );
            if (candRows.length > 0) {
                candidate_id = candRows[0].candidate_id;
            }
        }

        // Look up company_id from job_postings if missing
        if (!company_id && job_id) {
            const [jobRows] = await db.query(
                "SELECT company_id FROM job_postings WHERE job_id = ?",
                [job_id]
            );
            if (jobRows.length > 0) {
                company_id = jobRows[0].company_id;
            }
        }

        if (!company_id || !candidate_id) {
            return res.status(400).json({ error: "job_id, company_id, and candidate_id are required" });
        }

        // Validate user role is candidate
        const [userRoleRows] = await db.query(
            "SELECT u.role FROM candidates c JOIN users u ON c.user_id = u.user_id WHERE c.candidate_id = ?",
            [candidate_id]
        );
        if (userRoleRows.length > 0 && userRoleRows[0].role !== 'candidate') {
            return res.status(400).json({ error: "Only candidate accounts can apply to job postings" });
        }

        const [result] = await db.query(
            "INSERT INTO applications (job_id, company_id, candidate_id, resume_text, cover_letter) VALUES (?, ?, ?, ?, ?)",
            [job_id, company_id, candidate_id, resume_text || null, cover_letter || null]
        );
        // updating the candidate stats accurately
        await db.query(
            `UPDATE candidates 
             SET 
               applications_sent = (SELECT COUNT(*) FROM applications WHERE candidate_id = ?),
               interviews_scheduled = (SELECT COUNT(*) FROM applications WHERE candidate_id = ? AND LOWER(status) = 'interview'),
               jobs_accepted = (SELECT COUNT(*) FROM applications WHERE candidate_id = ? AND LOWER(status) = 'accepted'),
               not_selected = (SELECT COUNT(*) FROM applications WHERE candidate_id = ? AND LOWER(status) = 'rejected')
             WHERE candidate_id = ?`,
            [candidate_id, candidate_id, candidate_id, candidate_id, candidate_id]
        );

        res.status(201).json({
            app_id: result.insertId,
            job_id,
            company_id,
            candidate_id,
            status: "applied"
        });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: "You have already applied for this job" });
        }
        res.status(500).json({ error: err.message });
    }
}
async function getAllApplicationsByJob(req, res) {
    const { job_id } = req.params;

    try {
        const [rows] = await db.query(
            `SELECT a.app_id, a.job_id, a.company_id, a.candidate_id, a.status, a.resume_text, a.cover_letter, c.name, c.email
             FROM applications a
             JOIN candidates c ON a.candidate_id = c.candidate_id
             WHERE a.job_id = ?
             ORDER BY a.app_id DESC`,
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
            `SELECT a.app_id, a.job_id, a.company_id, a.candidate_id, a.status,
                    c.name AS candidate_name, c.email AS candidate_email,
                    j.job_title, j.job_location, comp.company_name
            FROM applications a
            JOIN candidates c ON a.candidate_id = c.candidate_id
            LEFT JOIN job_postings j ON a.job_id = j.job_id
            LEFT JOIN companies comp ON a.company_id = comp.company_id
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

        const [app] = await db.query("SELECT candidate_id FROM applications WHERE app_id = ?", [app_id]);
        if (app.length > 0) {
            const candidateId = app[0].candidate_id;

            // Recalculate and sync accurate candidate stats based on current application statuses
            await db.query(
                `UPDATE candidates 
                 SET 
                   applications_sent = (SELECT COUNT(*) FROM applications WHERE candidate_id = ?),
                   interviews_scheduled = (SELECT COUNT(*) FROM applications WHERE candidate_id = ? AND LOWER(status) = 'interview'),
                   jobs_accepted = (SELECT COUNT(*) FROM applications WHERE candidate_id = ? AND LOWER(status) = 'accepted'),
                   not_selected = (SELECT COUNT(*) FROM applications WHERE candidate_id = ? AND LOWER(status) = 'rejected')
                 WHERE candidate_id = ?`,
                [candidateId, candidateId, candidateId, candidateId, candidateId]
            );
        }

        res.json({ app_id, status });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function getAllApplicationsByEmployer(req, res) {
    const { employer_id } = req.params;
    try {
        const [rows] = await db.query(
            `SELECT a.app_id, a.job_id, a.company_id, a.candidate_id, a.status, a.resume_text, a.cover_letter,
                    c.name AS candidate_name, c.email AS candidate_email,
                    j.job_title, j.job_location, comp.company_name
            FROM applications a
            JOIN job_postings j ON a.job_id = j.job_id
            JOIN candidates c ON a.candidate_id = c.candidate_id
            LEFT JOIN companies comp ON a.company_id = comp.company_id
            WHERE j.employer_id = ?`,
            [employer_id]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

module.exports = { createApplication, getAllApplicationsByJob, getAllApplicationsByUser, getAllApplicationsByEmployer, updateApplication };