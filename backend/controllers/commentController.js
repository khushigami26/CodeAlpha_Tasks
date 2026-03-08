const Comment = require('../models/Comment');

const createComment = async (req, res) => {
    const { text, task } = req.body;

    try {
        const comment = new Comment({
            text,
            task,
            user: req.user._id,
        });

        const createdComment = await comment.save();

        await createdComment.populate('user', 'name');
        res.status(201).json(createdComment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getComments = async (req, res) => {
    const { taskId } = req.query;
    try {
        const comments = await Comment.find({ task: taskId })
            .populate('user', 'name')
            .sort({ createdAt: -1 });
        res.json(comments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createComment, getComments };
