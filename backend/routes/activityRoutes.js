const express = require('express');
const router = express.Router();
const Activity = require('../models/Activity');
const Project = require('../models/Project');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, async (req, res) => {
    try {
        const userProjects = await Project.find({
            $or: [{ owner: req.user._id }, { members: req.user._id }]
        }).select('_id');
        const projectIds = userProjects.map(p => p._id);

        const activities = await Activity.find({
            $or: [
                { project: { $in: projectIds } },
                { user: req.user._id }
            ]
        })
            .populate('user', 'name email')
            .populate('project', 'name')
            .sort({ createdAt: -1 })
            .limit(50);

        res.json(activities);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
