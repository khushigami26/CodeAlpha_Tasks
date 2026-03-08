const Task = require('../models/Task');
const logActivity = require('../utils/logger');

const createTask = async (req, res) => {
    const { title, project, assignedTo, status, color } = req.body;

    try {
        const task = new Task({
            title,
            project,
            assignedTo,
            status: status || 'todo',
            color: color || 'bg-[#0c66e4]',
        });

        const createdTask = await task.save();
        res.status(201).json(createdTask);
        await logActivity({
            user: req.user?._id,
            type: 'card',
            action: 'added',
            entityTitle: title,
            project: project
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getTasks = async (req, res) => {
    const { projectId } = req.query;
    try {
        const tasks = await Task.find({ project: projectId })
            .populate('assignedTo', 'name email')
            .populate('project', 'name');
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateTask = async (req, res) => {
    try {
        const { title, status, assignedTo, color } = req.body;
        const task = await Task.findById(req.params.id);

        if (task) {
            task.title = title || task.title;
            task.status = status || task.status;
            task.assignedTo = assignedTo || task.assignedTo;
            task.color = color || task.color;
            const updatedTask = await task.save();
            res.json(updatedTask);
            await logActivity({
                user: req.user?._id,
                type: 'card',
                action: status === 'done' ? 'marked complete' : 'updated',
                entityTitle: updatedTask.title,
                project: updatedTask.project
            });
        } else {
            res.status(404).json({ message: 'Task not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (task) {
            const title = task.title;
            const project = task.project;
            await task.deleteOne();
            res.json({ message: 'Task removed' });
            await logActivity({
                user: req.user?._id,
                type: 'card',
                action: 'removed',
                entityTitle: title,
                project: project
            });
        } else {
            res.status(404).json({ message: 'Task not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createTask, getTasks, updateTask, deleteTask };
