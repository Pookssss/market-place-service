const db = require('../config/db');

const Role = {
    findByName: async (name) => {
        const [rows] = await db.query('SELECT * FROM roles WHERE name = ?', [name]);
        return rows[0];
    }
};

module.exports = Role;
