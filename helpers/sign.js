const jwt = require('jsonwebtoken');
require('dotenv').config();

const jwtSecret = process.env.JWT_SECRET

const sign = async (payload) => {
    return await jwt.sign(payload, jwtSecret, { expiresIn: '100d'});
}

module.exports = sign;
