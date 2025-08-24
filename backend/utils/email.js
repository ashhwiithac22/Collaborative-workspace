const nodemailer = require('nodemailer');

// Create transporter - FIX THE TYPO: createTransporter → createTransport
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Send invitation email
const sendInvitationEmail = async (toEmail, inviterName, projectName, projectId) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: toEmail,
      subject: `You've been invited to collaborate on ${projectName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #6c63ff;">Collaboration Invitation</h2>
          <p>Hello!</p>
          <p><strong>${inviterName}</strong> has invited you to collaborate on the project: <strong>${projectName}</strong></p>
          <p>Click the button below to view the project (you'll need to login first):</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="http://localhost:3000/editor/${projectId}" 
               style="background: #6c63ff; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 6px; font-weight: bold;">
              View Project
            </a>
          </div>
          <p>Or copy this link: http://localhost:3000/editor/${projectId}</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">
            This is an automated message. Please do not reply to this email.
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Invitation email sent to:', toEmail);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send invitation email');
  }
};

// Mock email function for development (use this if you don't want to set up real email)
const sendMockInvitationEmail = async (toEmail, inviterName, projectName, projectId) => {
  console.log('📧 Mock Email Sent:');
  console.log('To:', toEmail);
  console.log('Subject: Collaboration invitation for', projectName);
  console.log('Message: You were invited by', inviterName);
  console.log('Project Link: http://localhost:3000/editor/' + projectId);
  console.log('---');
  
  return Promise.resolve();
};

// Use mock email for development, real email for production
module.exports = { 
  sendInvitationEmail: process.env.NODE_ENV === 'production' ? sendInvitationEmail : sendMockInvitationEmail
};