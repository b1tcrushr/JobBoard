const db = require("../db");

const ROLE_TYPES = ["Full-Time", "Part-Time", "Co-op"];
const PAY_GRADES = ["Grade 1", "Grade 2", "Grade 3", "Grade 4"];

async function ensureJobColumns() {
    try {
        await db.query("ALTER TABLE job_postings MODIFY COLUMN experience_level VARCHAR(255)");
    } catch (e) {
        // Table or column alter already handled
    }
}
ensureJobColumns();

async function getAllJobs(req, res) {
    try {
        const [rows] = await db.query(
            `SELECT j.job_id, j.employer_id, j.company_id, j.job_title, j.job_location, j.work_type, j.job_type, j.job_description, j.job_status, j.experience_level, j.role_type, j.pay_grade, j.requirements, j.responsibilities, j.benefits, c.company_name
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
    const employer_id = req.params.employer_id || req.body.employer_id;
    if (!employer_id) {
        return res.status(400).json({ error: "employer_id is required" });
    }

    try {
        const [rows] = await db.query(
            `SELECT j.job_id, j.employer_id, j.company_id, j.job_title, j.job_location, j.work_type, j.job_type, j.job_description, j.job_status, j.experience_level, j.role_type, j.pay_grade, j.requirements, j.responsibilities, j.benefits, c.company_name
             FROM job_postings j
             JOIN companies c ON j.company_id = c.company_id
             WHERE j.employer_id = ?`,
            [employer_id]
        );
        res.json(rows);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function getJobById(req, res) {
    const job_id = req.params.id || req.params.job_id || req.body.job_id;

    if (!job_id) {
        return res.status(400).json({ error: "job_id is required" });
    }

    try {
        const [rows] = await db.query(
            `SELECT j.job_id, j.employer_id, j.company_id, j.job_title, j.job_location, j.work_type, j.job_type, j.job_description, j.job_status, j.experience_level, j.role_type, j.pay_grade, j.requirements, j.responsibilities, j.benefits, c.company_name, c.industry, c.company_size, c.company_website, c.company_description
             FROM job_postings j
             JOIN companies c ON j.company_id = c.company_id
             WHERE j.job_id = ?`,
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
    const { employer_id, company_id, job_title, job_location, work_type, job_type, job_description, job_status, experience_level, role_type, pay_grade, requirements, responsibilities, benefits } = req.body;

    if (!employer_id || !company_id || !job_title || !work_type || !job_type || !job_description || !job_status) {
        return res.status(400).json({ error: "employer_id, company_id, job_title, work_type, job_type, job_description, and job_status are required" });
    }

    try {
        const [result] = await db.query(
            "INSERT INTO job_postings (employer_id, company_id, job_title, job_location, work_type, job_type, job_description, job_status, experience_level, role_type, pay_grade, requirements, responsibilities, benefits) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [employer_id, company_id, job_title, job_location, work_type, job_type, job_description, job_status, experience_level ?? null, role_type ?? null, pay_grade ?? null, requirements ?? null, responsibilities ?? null, benefits ?? null]
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
            job_status,
            experience_level,
            role_type,
            pay_grade,
            requirements,
            responsibilities,
            benefits
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
    const { title, location, jobType, workType, description, status, experienceLevel, roleType, payGrade, requirements, responsibilities, benefits } = req.body;

    if (!title || !workType || !jobType || !description || !status) {
        return res.status(400).json({ error: "title, workType, jobType, description, and status are required" });
    }

    try {
        const [result] = await db.query(
            "UPDATE job_postings SET job_title = ?, job_location = ?, work_type = ?, job_type = ?, job_description = ?, job_status = ?, experience_level = ?, role_type = ?, pay_grade = ?, requirements = ?, responsibilities = ?, benefits = ? WHERE job_id = ?",
            [title, location, workType, jobType, description, status, experienceLevel ?? null, roleType ?? null, payGrade ?? null, requirements ?? null, responsibilities ?? null, benefits ?? null, job_id]
        );


        res.json({ job_id, title, location, workType, jobType, description, status, experienceLevel, roleType, payGrade, requirements, responsibilities, benefits });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function reopenJobById(req, res) {
    const { job_id } = req.params;
    if (!job_id) {
        return res.status(400).json({ error: "Job Id required" });
    }
    try {
        const [result] = await db.query(
            "UPDATE job_postings SET job_status = 'open' WHERE job_id = ?",
            [job_id]
        );

        res.json({ job_id, job_status: "open" });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function getJobStats(req, res) {
    try {
        const [[totalResult]] = await db.query("SELECT COUNT(*) AS total_jobs FROM job_postings");
        const [[hiringResult]] = await db.query("SELECT COUNT(*) AS still_hiring FROM job_postings WHERE LOWER(job_status) = 'open'");
        const [[companiesResult]] = await db.query("SELECT COUNT(DISTINCT company_id) AS companies_hiring FROM job_postings WHERE LOWER(job_status) = 'open'");
        const [[appsResult]] = await db.query("SELECT COUNT(*) AS total_applications FROM applications");

        res.json({
            total_jobs: Number(totalResult?.total_jobs || 0),
            still_hiring: Number(hiringResult?.still_hiring || 0),
            companies_hiring: Number(companiesResult?.companies_hiring || 0),
            total_applications: Number(appsResult?.total_applications || 0)
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function getAllJobsAdmin(req, res) {
    try {
        const [rows] = await db.query(
            `SELECT j.job_id, j.employer_id, j.company_id, j.job_title, j.job_location, j.work_type, j.job_type, j.job_description, j.job_status, j.experience_level, j.role_type, j.pay_grade, j.requirements, j.responsibilities, j.benefits, c.company_name
             FROM job_postings j
             JOIN companies c ON j.company_id = c.company_id
             ORDER BY j.job_id DESC`
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function deleteJobPermanently(req, res) {
    const { job_id } = req.params;
    try {
        await db.query("DELETE FROM applications WHERE job_id = ?", [job_id]);
        const [result] = await db.query("DELETE FROM job_postings WHERE job_id = ?", [job_id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Job not found" });
        }
        res.json({ message: "Job deleted permanently", job_id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

module.exports = { getAllJobs, getJobByEmployer, getJobById, createJob, updateJobById, closeJobById, reopenJobById, getJobStats, getAllJobsAdmin, deleteJobPermanently };