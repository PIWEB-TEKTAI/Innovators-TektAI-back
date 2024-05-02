const nodemailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars');
const path = require('path');

const resetemail = async (toEmail, subject, template, resetPasswordLink, FirstName, LastName) => {
  // Create a Nodemailer transporter
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'tektaitektai7@gmail.com',
      pass: 'jiva rlyt bqba ozzb'
    }
  });

  const handlebarOptions = {
    viewEngine: {
        extName: '.hbs',
        partialsDir: path.resolve(__dirname, '../EmailTemplate/partials'),
        defaultLayout: false,
    },
    viewPath: path.resolve(__dirname, '../EmailTemplate/'),
    extName: '.hbs',
};

// Use Handlebars for email templates
transporter.use('compile', hbs(handlebarOptions));



  // Define mail options
  let mailOptions = {
    from: 'tektaitektai7@gmail.com',
    to: toEmail,
    subject: subject,
    template: template,
    context: {
      resetPasswordLink: resetPasswordLink,
        FirstName: FirstName,
        LastName: LastName,
    }
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
