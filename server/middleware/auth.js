const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; //header is in format: Authorization: Bearer <token>, we need to split

    if (!token) {
        return res.status(401).json({ error: "Access token required" });
    }

    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch {
        res.status(403).json({ error: "Invalid or expired token" });
    }
}

function optionalVerifyToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (token) {
        try {
            req.user = jwt.verify(token, process.env.JWT_SECRET);
        } catch {
            // Token invalid or expired, continue without req.user
        }
    }
    next();
}

module.exports = { verifyToken, optionalVerifyToken };
