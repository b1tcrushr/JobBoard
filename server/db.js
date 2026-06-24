const mysql = require("mysql2");

const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "password",
    database: "job_coop_portal"
});

module.exports = pool.promise();