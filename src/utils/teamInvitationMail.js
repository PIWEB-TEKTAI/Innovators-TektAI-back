const nodemailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars');
const path = require('path');

const teamInvitationMail = async (toEmail, subject, template, teamLink,teamName,userName) => {
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
      email: 'tektaitektai7@gmail.com',
      teamLink: teamLink ,
      teamName:teamName,
      userName:userName,
    }
};
  try {
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
    return { status: 'success' };
  } catch (error) {
    console.error('Error sending email:', error);
    return { status: 'error', error: error.message };
  }
};

module.exports = teamInvitationMail;