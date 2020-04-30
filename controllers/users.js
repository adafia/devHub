const mongoose = require('mongoose');
const gravatar = require('gravatar');
const { validationResult } = require('express-validator');
const { hash, compare } = require('../helpers/passwords');
const sign = require('../helpers/sign');

const User = mongoose.model('user')

const Users = {
    async register (req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }

        const { name, email, password } = req.body;

        try {
            let user = await User.findOne({ email });
            
            if (user) {
                return res.status(400).json({ errors: [{ msg: 'User already exists' }]})
            }

            const avatar = gravatar.url(email, {
                s: '200',
                r: 'pg',
                d: 'mm'
            })
    
            user = new User({
                name,
                email,
                avatar,
                password: await hash(password)
            });

            await user.save();

            const payload = {
                user: {
                    id: user.id
                }
            }
            const token = await sign(payload);

            return res.status(200).json({ token })

        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server error')
        }
    },

    async getUser (req, res) {
        try {
            const user = await User.findById(req.user.id).select('-password');

            return res.json(user);
        } catch (err) {
            console.error(err.message);
            return res.status(500).send('Server Error');
        }
    },

    async login (req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }

        const { email, password } = req.body;

        try {
            let user = await User.findOne({ email });
            
            if (!user) {
                return res.status(400).json({ errors: [{ msg: 'Invalid credentials' }]})
            }

            const isMatch = await compare(password, user.password);

            if (!isMatch) {
                return res.status(400).json({ errors: [{ msg: 'Invalid credentials' }]})
            }

            const payload = {
                user: {
                    id: user.id
                }
            }
            const token = await sign(payload);

            return res.status(200).json({ token })

        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server error')
        }
    }
}

module.exports = Users;
