const db = require("../db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

async function getAllUsers(req, res) {
    try {
        const [rows] = await db.query("SELECT id, name, email FROM users");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function getUsersById(req, res) {
    try {
        const [rows] = await db.query("SELECT id, name, email FROM users");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}



async function createUser(req, res) {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ error: "name, email, and password are required" });
    }

    try {
        //check if email in use
        const [existing] = await db.query("SELECT id FROM users WHERE email = ?", [email]);
        if (existing.length > 0) {
            return res.status(409).json({ error: "Email already in use" });
        }
        //hash the password, so its not stored in plaintext
        const passwordHash = await bcrypt.hash(password, 10);
        const [result] = await db.query(
            "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
            [name, email, passwordHash]
        );
        //sign jwt with id and email
        const token = jwt.sign(
            { id: result.insertId, email },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.status(201).json({ id: result.insertId, name, email, token });
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
            "SELECT id, name, email, password_hash FROM users WHERE email = ?",
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
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        
        res.json({
            message: "Logged in successfully",
            jwtToken,
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });


    }
    catch (err) {
         res.status(500).json({ error: err.message });
    }
}


module.exports = { getAllUsers, createUser, loginUser };