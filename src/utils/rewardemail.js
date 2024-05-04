const nodemailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars');
const path = require('path');

const rewardemail = async (toEmail, winnerName,challengetitle,amount,prizes,recruitement,freelance,internship,companyname,subject, template) => {
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
    context: {
      winnerName: winnerName,
      challengetitle: challengetitle,
      amount:amount,
      prizes:prizes,
      recruitement:recruitement,
      freelance:freelance,
      internship:internship,
      companyname:companyname

    },
    template: template
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

module.exports = rewardemail;
