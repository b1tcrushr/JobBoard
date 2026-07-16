const db = require("../db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

async function getAllUsers(req, res) {
    try {
        const [rows] = await db.query("SELECT user_id, name, email, role FROM users");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function getUsersById(req, res) {
    try {
        const [rows] = await db.query(
            "SELECT user_id, name, email, role FROM users WHERE user_id = ?",
            [req.params.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}



async function createUser(req, res) {
    const { name, email, password, role, company_name, industry, headquarters_location } = req.body;

    if (!name || !email || !password || !role) {
        return res.status(400).json({ error: "name, email, password, and role are required" });
    }

    if (role !== "candidate" && role !== "employer" && role !== "admin") {
        return res.status(400).json({ error: "role must be one of: candidate, employer, admin" });
    }

    if (role === "employer" && !company_name) {
        return res.status(400).json({ error: "company_name is required for employer accounts" });
    }

    try {
        //check if email in use
        const [existing] = await db.query("SELECT user_id FROM users WHERE email = ?", [email]);
        if (existing.length > 0) {
            return res.status(409).json({ error: "Email already in use" });
        }
        //hash the password, so its not stored in plaintext
        const passwordHash = await bcrypt.hash(password, 10);
        const [result] = await db.query(
            "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)",
            [name, email, passwordHash, role]
        );
        const userId = result.insertId;

        //create the matching profile row so job postings/applications have something to link to
        if (role === "candidate") {
            await db.query(
                "INSERT INTO candidates (user_id, email, name) VALUES (?, ?, ?)",
                [userId, email, name]
            );
        } else if (role === "employer") {
            //reuse the company if it already exists, otherwise create it
            const [existingCompany] = await db.query(
                "SELECT company_id FROM companies WHERE company_name = ?",
                [company_name]
            );

            let companyId;
            if (existingCompany.length > 0) {
                companyId = existingCompany[0].company_id;
            } else {
                const [companyResult] = await db.query(
                    "INSERT INTO companies (company_name, industry, headquarters_location) VALUES (?, ?, ?)",
                    [company_name, industry || null, headquarters_location || null]
                );
                companyId = companyResult.insertId;
            }

            await db.query(
                "INSERT INTO employers (user_id, company_id, email, name) VALUES (?, ?, ?, ?)",
                [userId, companyId, email, name]
            );
        }

        //sign jwt with id, email, and role
        const token = jwt.sign(
            { id: userId, email, role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.status(201).json({ id: userId, name, email, role, token });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function loginUser(req, res) {
    //assuming request is email, password
    const { email, password } = req.body;

    //if missing, send 400 res
     if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
    }

    try {
        const [rows] = await db.query(
            "SELECT user_id, name, email, password_hash, role FROM users WHERE email = ?",
            [email]
        );

        //nothing returned, invalid login
        if (rows.length === 0) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        const user = rows[0];

        const hashMatch = await bcrypt.compare(password, user.password_hash);
        if (!hashMatch) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        const jwtToken = jwt.sign(
            { id: user.user_id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );


        res.json({
            message: "Logged in successfully",
            jwtToken,
            user: {
                id: user.user_id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });


    }
    catch (err) {
         res.status(500).json({ error: err.message });
    }
}


module.exports = { getAllUsers, getUsersById, createUser, loginUser };