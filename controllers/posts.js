const mongoose = require('mongoose');
const { validationResult } = require('express-validator');

const Post = mongoose.model('Post')
const User = mongoose.model('User')

const Posts = {
    async create (req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }

        try {

            const user = await User.findById(req.user.id).select('-password');

            const post = new Post({
                text: req.body.text,
                name: user.name,
                avatar: user.avatar,
                user: req.user.id
            })
            
            await post.save()
            return res.json(post)
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server error')
        }
        
    },

    async getPosts (req, res) {
        try {
            const posts = await Post.find().sort({ date: -1 });
            return res.json(posts)
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server error')
        }
    },

    async getPostById (req, res) {
        try {
            const post = await Post.findById(req.params.id)

            if(!post) return res.status(404).json({ msg: 'Post not Found'});
            
            return res.json(post)
        } catch (err) {
            console.error(err.message);
            if(err.kind == 'ObjectId' || err.name == 'CastError') {
                return res.status(404).json({ msg: 'Post not Found'});
            }
            res.status(500).send('Server error')
        }
    },

    async deletePostById (req, res) {
        try {
            const post = await Post.findById(req.params.id)

            if(post.user.toString() !== req.user.id) {
                return res.status(401).json({ msg: 'Unauthorized action' })
            }

            if(!post) return res.status(404).json({ msg: 'Post not Found'});

            await post.remove();

            return res.json({ msg: 'Post removed'})
        } catch (err) {
            console.error(err.message);
            if(err.kind == 'ObjectId' || err.name == 'CastError') {
                return res.status(404).json({ msg: 'Post not Found'});
            }
            res.status(500).send('Server error')
        }
    },

    async like (req, res) {
        try {
            const post = await Post.findById(req.params.id);

            if (post.likes.filter(like => like.user.toString() === req.user.id).length > 0){
                return res.status(400).json({ msg: 'Post already liked' })
            }

            post.likes.unshift({ user: req.user.id })

            await post.save();
            return res.json(post.likes);
        } catch (err) {
            console.error(err.message);
            if(err.kind == 'ObjectId' || err.name == 'CastError') {
                return res.status(404).json({ msg: 'Post not Found'});
            }
            res.status(500).send('Server error')
        }
    },
    async unlike (req, res) {
        try {
            const post = await Post.findById(req.params.id);

            if (post.likes.filter(like => like.user.toString() === req.user.id).length === 0){
                return res.status(400).json({ msg: 'Post has not yet been liked' })
            }

            const removeIndex = post.likes.map(like => like.user.toString()).indexOf(req.user.id);

            post.likes.splice(removeIndex, 1);

            await post.save();
            return res.json(post.likes);
        } catch (err) {
            console.error(err.message);
            if(err.kind == 'ObjectId' || err.name == 'CastError') {
                return res.status(404).json({ msg: 'Post not Found'});
            }
            res.status(500).send('Server error')
        }
    },

    async comment (req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }

        try {

            const user = await User.findById(req.user.id).select('-password');
            const post = await Post.findById(req.params.id);


            const newComment = {
                text: req.body.text,
                name: user.name,
                avatar: user.avatar,
                user: req.user.id
            }
            post.comments.unshift(newComment)
            
            await post.save()
            return res.json(post.comments)
        } catch (err) {
            console.error(err.message);
            if(err.kind == 'ObjectId' || err.name == 'CastError') {
                return res.status(404).json({ msg: 'Post not Found'});
            }
            res.status(500).send('Server error')
        }
    },

    async deleteComment (req, res) {
        try {
            const post = await Post.findById(req.params.id);

            const comment = post.comments.find(comment => comment.id === req.params.commentId);

            if (!comment) {
                return res.status(404).json({ msg: 'Comment does not exist'});
            }

            if (comment.user.toString() !== req.user.id) {
                return res.status(401).json({ msg: 'Unauthorized action' })
            }

            const removeIndex = post.comments.map(comment => comment.user.toString()).indexOf(req.user.id);

            post.comments.splice(removeIndex, 1);

            await post.save()
            return res.json(post.comments);

        } catch (err) {
            console.error(err.message);
            if(err.kind == 'ObjectId' || err.name == 'CastError') {
                return res.status(404).json({ msg: 'Post not Found'});
            }
            res.status(500).send('Server error')
        }
    }
}

module.exports = Posts;
