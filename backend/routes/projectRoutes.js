const express = require('express');
const { createProject, getUserProjects, getProject, updateProject } = require('../controllers/projectController');
const auth = require('../middleware/auth'); // We'll create this next

const router = express.Router();

// All routes require authentication
router.use(auth);

// POST /api/projects - Create new project
router.post('/', createProject);

// GET /api/projects - Get user's projects
router.get('/', getUserProjects);

// GET /api/projects/:id - Get single project
router.get('/:id', getProject);

// PUT /api/projects/:id - Update project
router.put('/:id', updateProject);

module.exports = router;