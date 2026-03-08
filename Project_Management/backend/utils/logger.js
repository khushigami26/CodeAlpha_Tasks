const Activity = require('../models/Activity');

const logActivity = async ({ user, type, action, entityTitle, project }) => {
    try {
        await Activity.create({
            user,
            type,
            action,
            entityTitle,
            project
        });
    } catch (error) {
        console.error('Error logging activity:', error);
    }
};

module.exports = logActivity;
