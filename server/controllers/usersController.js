const db = require("../db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

async function ensureUserColumns() {
    try {
        await db.query("ALTER TABLE users ADD COLUMN phone VARCHAR(255)");
    } catch (e) {
        // Column already exists or table alter handled
    }
    try {
        await db.query("ALTER TABLE users ADD COLUMN location VARCHAR(255)");
    } catch (e) {
        // Column already exists or table alter handled
    }
}
ensureUserColumns();

async function getAllUsers(req, res) {
    try {
        const [rows] = await db.query("SELECT user_id, name, email, role, phone, location FROM users");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function getUsersById(req, res) {
    try {
        await ensureUserColumns();
        const [rows] = await db.query(
            "SELECT user_id, name, email, role, phone, location FROM users WHERE user_id = ?",
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
        if (role === "admin") {
            const [adminRows] = await db.query("SELECT COUNT(*) AS count FROM users WHERE LOWER(role) = 'admin'");
            const adminCount = adminRows[0].count;
            if (adminCount > 0 && req.user?.role !== "admin") {
                return res.status(400).json({
                    error: "An admin account already exists. New accounts can only be created as employer or candidate."
                });
            }
        }
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
            "SELECT user_id, name, email, password_hash, role, phone, location FROM users WHERE email = ?",
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
                role: user.role,
                phone: user.phone || "",
                location: user.location || ""
            }
        });
    }
    catch (err) {
         res.status(500).json({ error: err.message });
    }
}

async function updateUser(req, res) {
    const { user_id } = req.params;
    const { name, email, role, phone, location, currentPassword, newPassword, company_name, industry, headquarters_location, company_size, company_website, company_description } = req.body;

    try {
        await ensureUserColumns();
        const [rows] = await db.query(
            "SELECT user_id, name, email, password_hash, role, phone, location FROM users WHERE user_id = ?",
            [user_id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        const user = rows[0];

        // Validate and update password
        if (newPassword) {
            const isAdmin = req.user && req.user.role === 'admin';
            if (!isAdmin && !currentPassword) {
                return res.status(400).json({ error: "Current password is required to change password" });
            }

            if (currentPassword) {
                const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
                if (!isMatch) {
                    return res.status(400).json({ error: "Current password is incorrect" });
                }
            }

            if (newPassword.length < 8) {
                return res.status(400).json({ error: "New password must be at least 8 characters long" });
            }

            const newHash = await bcrypt.hash(newPassword, 10);
            await db.query("UPDATE users SET password_hash = ? WHERE user_id = ?", [newHash, user_id]);
        }

        // Update user fields across tables
        const updatedName = name ? name.trim() : user.name;
        const updatedEmail = email ? email.trim() : user.email;
        const updatedPhone = phone !== undefined ? phone.trim() : (user.phone || "");
        const updatedLocation = location !== undefined ? location.trim() : (user.location || "");
        const updatedRole = role && ['candidate', 'employer', 'admin'].includes(role.toLowerCase()) ? role.toLowerCase() : user.role;

        if (email && email.trim() !== user.email) {
            const [existing] = await db.query(
                "SELECT user_id FROM users WHERE email = ? AND user_id != ?",
                [email.trim(), user_id]
            );
            if (existing.length > 0) {
                return res.status(409).json({ error: "Email is already in use by another account" });
            }
        }

        await db.query(
            "UPDATE users SET name = ?, email = ?, role = ?, phone = ?, location = ? WHERE user_id = ?",
            [updatedName, updatedEmail, updatedRole, updatedPhone, updatedLocation, user_id]
        );

        // Sync Candidates profile table
        const [candRows] = await db.query("SELECT candidate_id FROM candidates WHERE user_id = ?", [user_id]);
        if (candRows.length > 0) {
            await db.query("UPDATE candidates SET name = ?, email = ? WHERE user_id = ?", [updatedName, updatedEmail, user_id]);
        } else if (updatedRole === 'candidate' || updatedRole === 'admin') {
            await db.query("INSERT INTO candidates (user_id, email, name) VALUES (?, ?, ?)", [user_id, updatedEmail, updatedName]);
        }

        // Sync Employers profile table & Company details
        const [empRows] = await db.query("SELECT employer_id, company_id FROM employers WHERE user_id = ?", [user_id]);
        if (empRows.length > 0) {
            const companyId = empRows[0].company_id;
            if (company_name || industry || company_size || company_website || company_description || headquarters_location) {
                await db.query(
                    `UPDATE companies 
                     SET company_name = COALESCE(?, company_name),
                         industry = COALESCE(?, industry),
                         company_size = COALESCE(?, company_size),
                         company_website = COALESCE(?, company_website),
                         company_description = COALESCE(?, company_description),
                         headquarters_location = COALESCE(?, headquarters_location)
                     WHERE company_id = ?`,
                    [
                        company_name ? company_name.trim() : null,
                        industry ? industry.trim() : null,
                        company_size ? company_size.trim() : null,
                        company_website ? company_website.trim() : null,
                        company_description ? company_description.trim() : null,
                        headquarters_location ? headquarters_location.trim() : null,
                        companyId
                    ]
                );
            }

            if (updatedRole === 'candidate') {
                const empId = empRows[0].employer_id;
                const [jobs] = await db.query("SELECT job_id FROM job_postings WHERE employer_id = ?", [empId]);
                if (jobs.length === 0) {
                    await db.query("DELETE FROM employers WHERE user_id = ?", [user_id]);
                } else {
                    await db.query("UPDATE employers SET name = ?, email = ? WHERE user_id = ?", [updatedName, updatedEmail, user_id]);
                }
            } else {
                await db.query("UPDATE employers SET name = ?, email = ? WHERE user_id = ?", [updatedName, updatedEmail, user_id]);
            }
        } else if (updatedRole === 'employer') {
            const companyName = company_name ? company_name.trim() : `${updatedName}'s Company`;
            const [compRes] = await db.query(
                "INSERT INTO companies (company_name, industry, headquarters_location, company_size, company_website, company_description) VALUES (?, ?, ?, ?, ?, ?)",
                [companyName, industry || null, headquarters_location || null, company_size || null, company_website || null, company_description || null]
            );
            await db.query("INSERT INTO employers (user_id, company_id, email, name) VALUES (?, ?, ?, ?)", [user_id, compRes.insertId, updatedEmail, updatedName]);
        }

        res.json({
            message: "Account updated successfully",
            user: {
                id: user.user_id,
                user_id: user.user_id,
                name: updatedName,
                email: updatedEmail,
                role: updatedRole,
                phone: updatedPhone,
                location: updatedLocation
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function deleteUser(req, res) {
    const { user_id } = req.params;
    try {
        const [existing] = await db.query("SELECT user_id FROM users WHERE user_id = ?", [user_id]);
        if (existing.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        await db.query("DELETE FROM candidates WHERE user_id = ?", [user_id]);
        await db.query("DELETE FROM employers WHERE user_id = ?", [user_id]);
        await db.query("DELETE FROM users WHERE user_id = ?", [user_id]);

        res.json({ message: "User deleted successfully", user_id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function checkAdminExists(req, res) {
    try {
        const [rows] = await db.query("SELECT COUNT(*) AS count FROM users WHERE LOWER(role) = 'admin'");
        const adminCount = rows[0].count;
        res.json({ adminExists: adminCount > 0, count: adminCount });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

module.exports = { getAllUsers, getUsersById, createUser, loginUser, updateUser, deleteUser, checkAdminExists };