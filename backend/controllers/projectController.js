const Project = require('../models/Project');

// Create a new project
exports.createProject = async (req, res) => {
  try {
    const { name, description, language, isPublic } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'Project name is required' });
    }

    const project = new Project({
      name,
      description,
      language,
      isPublic,
      owner: req.userId,
      collaborators: [{
        user: req.userId,
        role: 'editor'
      }]
    });

    await project.save();
    
    // Populate owner details
    await project.populate('owner', 'name email');
    
    res.status(201).json({
      message: 'Project created successfully',
      project
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ message: 'Server error creating project' });
  }
};

// Get all projects for a user
exports.getUserProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [
        { owner: req.userId },
        { 'collaborators.user': req.userId }
      ]
    })
    .populate('owner', 'name email')
    .populate('collaborators.user', 'name email')
    .sort({ updatedAt: -1 });

    res.json({ projects });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ message: 'Server error fetching projects' });
  }
};

// Get single project
exports.getProject = async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      $or: [
        { owner: req.userId },
        { 'collaborators.user': req.userId }
      ]
    })
    .populate('owner', 'name email')
    .populate('collaborators.user', 'name email');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json({ project });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ message: 'Server error fetching project' });
  }
};

// Update project
exports.updateProject = async (req, res) => {
  try {
    const { name, description, code, language, isPublic } = req.body;
    
    const project = await Project.findOneAndUpdate(
      {
        _id: req.params.id,
        $or: [
          { owner: req.userId },
          { 
            'collaborators.user': req.userId,
            'collaborators.role': 'editor'
          }
        ]
      },
      { name, description, code, language, isPublic, updatedAt: Date.now() },
      { new: true, runValidators: true }
    )
    .populate('owner', 'name email')
    .populate('collaborators.user', 'name email');

    if (!project) {
      return res.status(404).json({ message: 'Project not found or no edit permission' });
    }

    res.json({ message: 'Project updated successfully', project });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ message: 'Server error updating project' });
  }
};