const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Notification = require('../models/Notification');
const Project = require('../models/Project');
const Activity = require('../models/Activity');

// Get user notifications
router.get('/', protect, async (req, res) => {
    try {
        const notifications = await Notification.find({ user: req.user._id })
            .populate('fromUser', 'name email')
            .populate('project', 'name')
            .sort({ createdAt: -1 });
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get invitations sent by  user
router.get('/sent', protect, async (req, res) => {
    try {
        const notifications = await Notification.find({ fromUser: req.user._id, type: 'invite' });
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Accept invitation
router.post('/:id/accept', protect, async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        if (notification.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const inviterId = notification.fromUser;
        const inviteeId = req.user._id;

        // 1. Add invitee to all projects of the inviter
        const inviterProjects = await Project.find({ owner: inviterId });
        let addedToInviterCount = 0;

        for (const project of inviterProjects) {
            if (!project.members.includes(inviteeId)) {
                project.members.push(inviteeId);
                await project.save();
                addedToInviterCount++;
            }
        }

        // 2. Add inviter to all projects of the invitee (Mutual Collaboration)
        const inviteeProjects = await Project.find({ owner: inviteeId });
        let addedToInviteeCount = 0;

        for (const project of inviteeProjects) {
            if (!project.members.includes(inviterId)) {
                project.members.push(inviterId);
                await project.save();
                addedToInviteeCount++;
            }
        }

        if (addedToInviterCount > 0 || addedToInviteeCount > 0) {
            // Create activity logged for the workspace joining
            await Activity.create({
                user: inviteeId,
                type: 'collab',
                action: 'joined',
                entityTitle: 'Workspace',
                project: inviterProjects.length > 0 ? inviterProjects[0]._id : (inviteeProjects.length > 0 ? inviteeProjects[0]._id : null)
            });

            // Emit socket notifications
            const io = req.app.get('socketio');
            if (io) {
                io.emit('activityAdded', {});
                // Notify inviter
                io.emit('new-notification', {
                    user: inviterId.toString(),
                    type: 'collab',
                    title: 'Mutual Collaboration Active',
                    desc: `${req.user.name} accepted your invite. You can now see each other's workspaces.`,
                    time: 'Just now'
                });
            }
        }

        // Delete notification after processing
        await Notification.findByIdAndDelete(req.params.id);

        res.json({ message: 'Mutual invitation accepted successfully' });
    } catch (error) {
        console.error('Accept invitation error:', error);
        res.status(500).json({ message: error.message });
    }
});

// Decline invitation
router.post('/:id/decline', protect, async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        if (notification.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        // Delete notification
        await Notification.findByIdAndDelete(req.params.id);

        res.json({ message: 'Invitation declined' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
