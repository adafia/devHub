const express = require('express');
const auth = require('../../middleware/auth');
const { createPostValidations } = require('../../helpers/checks');
const { create, getPosts, getPostById, deletePostById, like, unlike, comment, deleteComment } = require('../../controllers/posts');
const router = express.Router();

// @route   GET api/posts
// @desc    Test route
// @access  Public
router.post('/', [auth, createPostValidations], create);
router.get('/', auth, getPosts);
router.get('/:id', auth, getPostById);
router.delete('/:id', auth, deletePostById);
router.put('/like/:id', auth, like);
router.put('/unlike/:id', auth, unlike);
router.post('/comment/:id', [auth, createPostValidations], comment);
router.delete('/comment/:id/:commentId', auth, deleteComment);


module.exports = router;
