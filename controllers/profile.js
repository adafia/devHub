const mongoose = require('mongoose');
const { validationResult } = require('express-validator');
const request = require('request');
const config = require('config');

const Profile = mongoose.model('Profile');
const User = mongoose.model('User');
const Post = mongoose.model('Post');

const Profiles = {
    async getProfileByUserId (req, res) {
        try {
            const profile = await Profile.findOne({ user: req.params.userId }).populate('User', ['name', 'avatar']);

            if (!profile) {
                return res.status(400).json({ msg: 'Profile not found'})
            }
            
            return res.json(profile);

        } catch (err) {
            console.error(err.message);
            if (err.kind == 'ObjectId' || err.name == 'CastError') {
                return res.status(400).json({ msg: 'Profile not found'})
            }
            res.status(500).send('Server Error');
        }
    },

    async getProfile (req, res) {
        try {
            const profile = await Profile.findOne({ user: req.user.id }).populate('User', ['name', 'avatar']);

            if (!profile) {
                return res.status(400).json({ msg: 'There is no profile for this user'})
            }
            
            return res.json(profile);

        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    },

    async getProfiles (req, res) {
        try {
            const profiles = await Profile.find().populate('User', ['name', 'avatar']);
            return res.json(profiles)
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error')
        }
    },

    async create (req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }

        const { company, website, location, bio, status, githubusername, skills, youtube, facebook, twitter, instagram, linkedin } = req.body;


        const profileFields = {};
        profileFields.social = {}

        profileFields.user = req.user.id;
        
        if (company) profileFields.company = company;    
        if (website) profileFields.website = website;    
        if (location) profileFields.location = location;    
        if (bio) profileFields.bio = bio;    
        if (githubusername) profileFields.githubusername = githubusername;
        if (status) profileFields.status = status;
        if (skills) profileFields.skills = skills.split(',').map(skill => skill.trim());
   
        if (youtube) profileFields.social.youtube = youtube;    
        if (facebook) profileFields.social.facebook = facebook;    
        if (twitter) profileFields.social.twitter = twitter;    
        if (instagram) profileFields.social.instagram = instagram;    
        if (linkedin) profileFields.social.linkedin = linkedin;
        
        try {
            let profile = await Profile.findOne({ user: req.user.id });
            if(profile) {
                profile = await Profile.findOneAndUpdate({ user: req.user.id }, { $set: profileFields }, { new: true })
            } else {
                profile = await new Profile(profileFields);
            }
            
            await profile.save();
            return res.json(profile);
            

        } catch (err) {
            console.error(err.message);
            return res.status(500).send('Server Error')
        }

    },

    async deleteProfile (req, res) {
        try {
            await Post.deleteMany({ user: req.user.id })
            await Profile.findOneAndRemove({ user: req.user.id });
            await User.findOneAndRemove({ _id: req.user.id });

            res.json({ msg: 'User deleted'})
        } catch (err) {
            console.error(err.message);
            return res.status(500).send('Server Error')
        }
    },
    
    async experience (req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }

        const { title, company, location, from, to, current, description } = req.body;

        const newExp = {
            title, company, location, from, to, current, description
        }

        try {
            const profile = await Profile.findOne({ user: req.user.id });

            profile.experience.unshift(newExp);
            await profile.save()
            res.json(profile)
            
        } catch (err) {
            console.error(err.message);
            return res.status(500).send('Server Error')
        }
    },

    async deleteExperience (req, res) {
        try {
            const profile = await Profile.findOne({ user: req.user.id });

            const removeIndex = profile.experience.map(item => item.id).indexOf(req.params.expId);

            profile.experience.splice(removeIndex, 1)

            await profile.save();
            return res.json(profile);
        } catch (err) {
            console.error(err.message);
            return res.status(500).send('Server Error')
        }
    },

    async education (req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }

        const { school, degree, fieldofstudy, from, to, current, description } = req.body;

        const newEdu = {
            school, degree, fieldofstudy, from, to, current, description
        }

        try {
            const profile = await Profile.findOne({ user: req.user.id });

            profile.education.unshift(newEdu);
            await profile.save()
            res.json(profile)
            
        } catch (err) {
            console.error(err.message);
            return res.status(500).send('Server Error')
        }
    },

    async deleteEducation (req, res) {
        try {
            const profile = await Profile.findOne({ user: req.user.id });

            const removeIndex = profile.education.map(item => item.id).indexOf(req.params.eduId);

            profile.education.splice(removeIndex, 1)

            await profile.save();
            return res.json(profile);
        } catch (err) {
            console.error(err.message);
            return res.status(500).send('Server Error')
        }
    },

    async githubRepos (req, res) {
        try {
            const options = {
                uri: `https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc&client_id=${config.get('githubClientId')}&client_secret=${config.get('githubSecret')}`,
                method: 'GET',
                headers: { 'user-agent': 'node.js' }
            };

            request(options, (error, response, body) => {
                if (error) console.error(error)

                if (response.statusCode !== 200) {
                    return res.status(404).json({ msg: 'No Github profile found' })
                }

                return res.json(JSON.parse(body))
            })
        } catch (err) {
            console.error(err.message);
            return res.status(500).send('Server Error')
        }
    }
}

module.exports = Profiles;
