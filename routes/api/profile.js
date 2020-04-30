const express = require('express');
const auth = require('../../middleware/auth')
const { getProfile, create, getProfiles, getProfileByUserId, deleteProfile, experience, deleteExperience, education, deleteEducation } = require('../../controllers/profile');
const { createProfileValidations, experienceValidations, educationValidations } = require('../../helpers/checks');
const router = express.Router();


// @route   GET api/profile
// @desc    Test route
// @access  Private
router.get('/user/:userId', getProfileByUserId);
router.get('/me', auth, getProfile);
router.get('/', getProfiles);
router.post('/', [auth, createProfileValidations ], create);
router.delete('/', auth, deleteProfile);
router.put('/experience', [auth, experienceValidations], experience);
router.delete('/experience/:expId', [auth], deleteExperience);
router.put('/education', [auth, educationValidations], education);
router.delete('/education/:eduId', [auth], deleteEducation);


module.exports = router;
