const express = require('express');
const { 
  createProject, 
  getUserProjects, 
  getProject, 
  updateProject, 
  addCollaborator  // Make sure this is imported
} = require('../controllers/projectController');
const auth = require('../middleware/auth');

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

// POST /api/projects/:id/collaborators - Add collaborator
router.post('/:id/collaborators', addCollaborator);

module.exports = router;