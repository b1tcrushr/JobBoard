const db = require("../db");

function getAllUsers(req, res) {
    try {

    } catch (err) {
        const [rows] = await db.query("SELECT * FROM company");
    }
    res.json(users);
}

module.exports = { getAllUsers };