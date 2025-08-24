const express = require('express');
const { executeCode } = require('../controllers/codeExecutionController');
const auth = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(auth);

// POST /api/execute/:id - Execute code
router.post('/:id', executeCode);

module.exports = router;