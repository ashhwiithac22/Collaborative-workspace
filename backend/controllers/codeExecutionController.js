const axios = require('axios');

// Execute code using Piston API
exports.executeCode = async (req, res) => {
  try {
    const { code, language } = req.body;
    const projectId = req.params.id;

    console.log('Executing code:', { projectId, language, codeLength: code.length });

    // Map your language names to Piston language names and versions
    const languageMap = {
      'javascript': { name: 'javascript', version: '18.15.0' },
      'python': { name: 'python', version: '3.10.0' },
      'java': { name: 'java', version: '15.0.2' },
      'cpp': { name: 'cpp', version: '10.2.0' }
    };

    const pistonConfig = languageMap[language];
    if (!pistonConfig) {
      return res.status(400).json({ message: 'Unsupported language' });
    }

    // Execute code using Piston API
    const response = await axios.post('https://emkc.org/api/v2/piston/execute', {
      language: pistonConfig.name,
      version: pistonConfig.version,
      files: [{ content: code }]
    }, {
      timeout: 15000 // 15 second timeout
    });

    const result = response.data;

    res.json({
      output: result.run.output,
      executionTime: result.run.time,
      memory: result.run.memory,
      language: result.language
    });

  } catch (error) {
    console.error('Code execution error:', error.message);
    
    if (error.code === 'ECONNABORTED') {
      return res.status(408).json({ message: 'Execution timeout' });
    }
    
    if (error.response?.data) {
      console.error('Piston API error:', error.response.data);
      return res.status(400).json({ 
        message: 'Execution failed', 
        error: error.response.data 
      });
    }

    res.status(500).json({ message: 'Code execution server error' });
  }
};