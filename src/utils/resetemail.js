const nodemailer = require('nodemailer');

const resetemail = async (toEmail, subject, htmlContent) => {
  // Create a Nodemailer transporter
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'gestionstockapii@gmail.com',
      pass: 'dhxo jaxk ewnv xsyr'
    }
  });

  // Define mail options
  let mailOptions = {
    from: 'gestionstockapii@gmail.com',
    to: toEmail,
    subject: subject,
    html: htmlContent
  };

  try {
    // Send email
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
    return { status: 'success' };
  } catch (error) {
    console.error('Error sending email:', error);
    return { status: 'error', error: error.message };
  }
};

module.exports = resetemail;
