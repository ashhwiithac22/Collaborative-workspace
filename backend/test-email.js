// Create /backend/test-email.js
require('dotenv').config();
const { sendInvitationEmail } = require('./utils/email');

async function testEmail() {
  console.log('Testing email configuration...');
  console.log('EMAIL_USER:', process.env.EMAIL_USER ? 'Set' : 'Not set');
  console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'Set' : 'Not set');
  
  try {
    await sendInvitationEmail(
      'test@example.com',
      'Test User',
      'Test Project',
      '123456789'
    );
    console.log('✅ Email test completed');
  } catch (error) {
    console.error('❌ Email test failed:', error);
  }
}

testEmail();