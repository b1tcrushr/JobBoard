const db = require("../db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

async function getAllUsers(req, res) {
    try {
        const [rows] = await db.query("SELECT user_id, email, role FROM users");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function getUsersById(req, res) {
    try {
        const [rows] = await db.query(
            "SELECT user_id, email, role FROM users WHERE user_id = ?",
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
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
        return res.status(400).json({ error: "email, password, and role are required" });
    }

    if (role !== "candidate" && role !== "employer" && role !== "admin") {
        return res.status(400).json({ error: "role must be one of: candidate, employer, admin" });
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
            "INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)",
            [email, passwordHash, role]
        );
        //sign jwt with id, email, and role
        const token = jwt.sign(
            { id: result.insertId, email, role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.status(201).json({ id: result.insertId, email, role, token });
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
            "SELECT user_id, email, password_hash, role FROM users WHERE email = ?",
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