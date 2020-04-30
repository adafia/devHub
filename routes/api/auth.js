const express = require('express');
const auth = require('../../middleware/auth')
const { getUser, login } = require('../../controllers/users')
const { loginValidations } = require('../../helpers/checks')
const router = express.Router();

// @route   GET api/auth
// @desc    Test route
// @access  Public
router.get('/', auth, getUser);
router.post('/', loginValidations, login);


module.exports = router;
