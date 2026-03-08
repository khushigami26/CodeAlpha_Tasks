const Project = require('../models/Project');
const logActivity = require('../utils/logger');

const createProject = async (req, res) => {
    const { name, background } = req.body;

    try {
        // Find all unique members from the user's existing projects to maintain the "Workspace" feel
        const userProjects = await Project.find({ owner: req.user._id });
        const workspaceMembers = [];
        workspaceMembers.push(req.user._id.toString()); // Ensure owner is included

        for (let i = 0; i < userProjects.length; i++) {
            let project = userProjects[i];
            for (let j = 0; j < project.members.length; j++) {
                let memberIdStr = project.members[j].toString();
                if (!workspaceMembers.includes(memberIdStr)) {
                    workspaceMembers.push(memberIdStr);
                }
            }
        }

        const project = new Project({
            name,
            owner: req.user._id,
            members: workspaceMembers,
            background: background || 'bg-[#f0f9ff]',
        });

        const createdProject = await project.save();
        res.status(201).json(createdProject);
        await logActivity({
            user: req.user?._id,
            type: 'board',
            action: 'created',
            entityTitle: name,
            project: createdProject._id
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getProjects = async (req, res) => {
    try {
        const projects = await Project.find({
            $or: [
                { owner: req.user._id },
                { members: req.user._id }
            ]
        }).populate('owner', 'name email').populate('members', 'name email');
        res.json(projects);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getProjectById = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id)
            .populate('owner', 'name email')
            .populate('members', 'name email');

        if (project) {
            const isOwner = project.owner._id.toString() === req.user._id.toString();
            const isMember = project.members.some(m => m._id.toString() === req.user._id.toString());

            if (!isOwner && !isMember) {
                return res.status(401).json({ message: 'Not authorized to view this board' });
            }

            res.json(project);
        } else {
            res.status(404).json({ message: 'Project not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateProject = async (req, res) => {
    try {
        const { name, members, lists, background } = req.body;
        const project = await Project.findById(req.params.id);

        if (project) {
            if (project.owner.toString() !== req.user._id.toString()) {
                return res.status(401).json({ message: 'Not authorized' });
            }
            project.name = name || project.name;
            project.members = members || project.members;
            project.lists = lists || project.lists;
            project.background = background || project.background;

            const updatedProject = await project.save();
            res.json(updatedProject);
            await logActivity({
                user: req.user?._id,
                type: 'board',
                action: 'updated',
                entityTitle: name || project.name,
                project: project._id
            });
        } else {
            res.status(404).json({ message: 'Project not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (project) {
            if (project.owner.toString() !== req.user._id.toString()) {
                return res.status(401).json({ message: 'Not authorized' });
            }
            const name = project.name;
            const id = project._id;
            await project.deleteOne();
            res.json({ message: 'Project removed' });
            await logActivity({
                user: req.user?._id,
                type: 'board',
                action: 'removed',
                entityTitle: name,
                project: id
            });
        } else {
            res.status(404).json({ message: 'Project not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const Notification = require('../models/Notification');

const inviteUser = async (req, res) => {
    try {
        const { userId } = req.body;

        // Find all projects owned by  current user
        const projects = await Project.find({ owner: req.user._id });

        if (projects.length === 0) {
            return res.status(400).json({ message: 'Create a board first before inviting users to your Workspace.' });
        }

        // Check  user is already a member of any project
        const isAlreadyMember = projects.some(p => p.members.some(m => m.toString() === userId));
        if (isAlreadyMember) {
            return res.status(400).json({ message: 'User is already a member of your workspace' });
        }

        // Check if already invited
        const exists = await Notification.findOne({ user: userId, fromUser: req.user._id, type: 'invite' });
        if (exists) {
            return res.status(400).json({ message: 'Invitation is already pending' });
        }

        const notification = await Notification.create({
            user: userId,
            type: 'invite',
            fromUser: req.user._id
        });

        // socket emit
        const io = req.app.get('socketio');
        if (io) {
            io.emit('new-notification', {
                user: userId,
                type: 'collab',
                title: 'Workspace Invitation',
                desc: `${req.user.name} invited you to join their workspace.`,
                time: 'Just now',
                action: 'invite',
                notificationId: notification._id
            });
            io.emit('activityAdded', {});
        }

        res.json({ message: 'User invited successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const removeMember = async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.user._id.toString();

        console.log(`[MUTUAL REMOVE] User ${currentUserId} removing collaboration with ${userId}`);


        const ownProjects = await Project.find({ owner: req.user._id });
        let removedFromOwn = 0;
        for (const project of ownProjects) {
            const initialLength = project.members.length;
            project.members = project.members.filter(m => m.toString() !== userId.toString());
            if (project.members.length !== initialLength) {
                await project.save();
                removedFromOwn++;
            }
        }


        const targetProjects = await Project.find({ owner: userId });
        let removedFromTarget = 0;
        for (const project of targetProjects) {
            const initialLength = project.members.length;
            project.members = project.members.filter(m => m.toString() !== currentUserId);
            if (project.members.length !== initialLength) {
                await project.save();
                removedFromTarget++;
            }
        }

        console.log(`[MUTUAL REMOVE] Result: Removed target from ${removedFromOwn} own projects, removed self from ${removedFromTarget} target projects`);

        await Notification.deleteMany({
            $or: [
                { user: userId, fromUser: currentUserId, type: 'invite' },
                { user: currentUserId, fromUser: userId, type: 'invite' }
            ]
        });

        // Notify via socket
        const io = req.app.get('socketio');
        if (io) {
            io.emit('activityAdded', {});

            io.emit('new-notification', {
                user: userId,
                type: 'collab',
                title: 'Collaboration Ended',
                desc: `${req.user.name} has ended their collaboration with you.`,
                time: 'Just now'
            });
        }

        res.json({ message: 'Mutual collaboration removal successful' });
    } catch (error) {
        console.error('Mutual remove member error:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createProject, getProjects, getProjectById, updateProject, deleteProject, inviteUser, removeMember };
