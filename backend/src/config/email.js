const nodemailer = require('nodemailer');

/**
 * Sends a welcome email to the newly created administrator containing their credentials and instructions.
 * @param {Object} params
 * @param {string} params.email - Registered email
 * @param {string} params.name - Registered name
 * @param {string} params.role - Administrator role
 * @param {string} params.tempPassword - Auto-generated temporary password
 * @param {string} params.adminId - Admin's unique system identifier (User ID)
 */
const sendWelcomeEmail = async ({ email, name, role, tempPassword, adminId }) => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (!emailUser || !emailPass) {
    console.warn('⚠️ EMAIL_USER or EMAIL_PASS not configured. Skipping welcome email sending.');
    console.log('--------------------------------------------------');
    console.log(`🔑 Credentials for new admin (${role}):`);
    console.log(`Admin ID: ${adminId}`);
    console.log(`Email: ${email}`);
    console.log(`Password: ${tempPassword}`);
    console.log('--------------------------------------------------');
    return false;
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });

  const roleLabel = role.replace('_', ' ');

  const mailOptions = {
    from: `"Smart Digital LMS" <${emailUser}>`,
    to: email,
    subject: 'Welcome to SDLMS - Your Administrator Credentials',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 25px;">
          <div style="display: inline-block; padding: 12px; border-radius: 12px; background: linear-gradient(135deg, #0891b2, #a855f7); color: white; font-weight: bold; font-size: 1.5em;">
            SDLMS
          </div>
          <h2 style="color: #0f172a; margin-top: 15px; margin-bottom: 5px;">Welcome to the Platform!</h2>
          <p style="color: #64748b; margin: 0; font-size: 0.95em;">Your administrator account is now active.</p>
        </div>

        <p style="color: #334155; font-size: 1em; line-height: 1.6;">Dear <strong>${name}</strong>,</p>
        <p style="color: #334155; font-size: 1em; line-height: 1.6;">An administrative account has been provisioned for you on the Smart Digital Learning Management System (SDLMS). Please use the following details to access your dashboard:</p>
        
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px; margin: 25px 0;">
          <table style="width: 100%; border-collapse: collapse; font-size: 0.95em; color: #334155;">
            <tr>
              <td style="padding: 6px 0; font-weight: bold; width: 140px; color: #64748b;">Role:</td>
              <td style="padding: 6px 0; font-weight: 600; color: #0f172a;">${roleLabel}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: bold; color: #64748b;">Admin ID:</td>
              <td style="padding: 6px 0; font-family: monospace; font-size: 1.05em; color: #0f172a;">${adminId}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: bold; color: #64748b;">Email Address:</td>
              <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">${email}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: bold; color: #64748b;">Temporary Password:</td>
              <td style="padding: 6px 0; color: #0891b2; font-family: monospace; font-size: 1.15em; font-weight: bold; letter-spacing: 0.5px;">${tempPassword}</td>
            </tr>
          </table>
        </div>

        <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 15px; margin: 25px 0; border-radius: 6px;">
          <p style="margin: 0; font-size: 0.9em; color: #78350f; line-height: 1.5;">
            <strong>🔒 Password Security Notice:</strong><br/>
            This is an auto-generated password. If you wish to change it later, you can do so at any time using the <strong>'Forgot Password'</strong> link on the login page.
          </p>
        </div>

        <div style="text-align: center; margin-top: 30px; margin-bottom: 20px;">
          <a href="${process.env.FRONTEND_URL || 'https://sdlms-frontend.vercel.app'}/auth/login" style="background: linear-gradient(135deg, #0891b2, #0d9488); color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; box-shadow: 0 4px 10px rgba(8, 145, 178, 0.25);">Login to Dashboard</a>
        </div>

        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin-top: 30px; margin-bottom: 20px;"/>
        <p style="font-size: 0.8em; color: #94a3b8; text-align: center; line-height: 1.4; margin: 0;">
          This is an automated system message. Please do not reply directly to this email.<br/>
          Smart Digital LMS © 2026
        </p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✉️ Welcome email sent successfully to ${email}. Message ID: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to send welcome email:', error.message);
    return false;
  }
};

module.exports = { sendWelcomeEmail };
