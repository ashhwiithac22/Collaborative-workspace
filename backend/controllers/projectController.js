const Project = require('../models/Project');
const User = require('../models/User');
const { sendInvitationEmail } = require('../utils/email');

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
// Get single project - FIX POPULATION
exports.getProject = async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      $or: [
        { owner: req.userId },
        { 'collaborators.user': req.userId }
      ]
    })
    .populate('owner', 'name email _id')  // ADD _id to population
    .populate('collaborators.user', 'name email _id');  // ADD _id to population

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

// Add collaborator to project
exports.addCollaborator = async (req, res) => {
  try {
    const { email, role } = req.body;
    const projectId = req.params.id;

    console.log('Adding collaborator:', { projectId, email, role });

    // Find the project
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is project owner
    if (project.owner.toString() !== req.userId) {
      return res.status(403).json({ message: 'Only project owner can add collaborators' });
    }

    // Find the user by email
    const userToAdd = await User.findOne({ email });
    if (!userToAdd) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user is already a collaborator
    const alreadyCollaborator = project.collaborators.some(
      collab => collab.user && collab.user.toString() === userToAdd._id.toString()
    );

    if (alreadyCollaborator) {
      return res.status(400).json({ message: 'User is already a collaborator' });
    }

    // Add collaborator
    project.collaborators.push({
      user: userToAdd._id,
      role: role || 'editor'
    });

    await project.save();
    
    // Populate the new collaborator info
    await project.populate('collaborators.user', 'name email');

    // Send invitation email
    try {
      const inviter = await User.findById(req.userId);
      console.log('Sending invitation email to:', email);
      
      await sendInvitationEmail(
        email,
        inviter.name,
        project.name,
        projectId
      );
      
      console.log('✅ Email invitation sent successfully');
    } catch (emailError) {
      console.error('❌ Email sending failed:', emailError.message);
      console.log('⚠️ Collaborator was added, but email failed to send');
      // Don't fail the whole request if email fails
    }

    res.json({ 
      message: 'Collaborator added successfully. Invitation email sent.',
      project 
    });
  } catch (error) {
    console.error('Add collaborator error:', error);
    res.status(500).json({ message: 'Server error adding collaborator: ' + error.message });
  }
};