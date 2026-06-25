const db = require("../db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


async function createApplication(req, res) {
    const { applicationID, resume } = req.body;

    if (!applicationID || !resume ) {
        return res.status(400).json({ error: "applicationId and resume must be attached in body" });
    }

    try {
    
        res.send(200);
        
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}