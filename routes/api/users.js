const express = require('express');
const { register } = require('../../controllers/users') 
const { registerValidations } = require('../../helpers/checks')
const router = express.Router();


// @route   GET api/users
// @desc    Register user
// @access  Public
router.post('/', registerValidations, register);


module.exports = router;
