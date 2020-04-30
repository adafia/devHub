const jwt = require('jsonwebtoken');
const config = require('config')

const sign = async (payload) => {
    return await jwt.sign(payload, config.get('jwtSecret'), { expiresIn: '1d'});
}

module.exports = sign;
