const express = require('express');
const { createProject, getProjects, getProjectById, updateProject, deleteProject, inviteUser, removeMember } = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.route('/')
    .post(protect, createProject)
    .get(protect, getProjects);

router.route('/invite')
    .post(protect, inviteUser);

router.route('/member/:userId')
    .delete(protect, removeMember);

router.route('/:id')
    .get(protect, getProjectById)
    .put(protect, updateProject)
    .delete(protect, deleteProject);

module.exports = router;
