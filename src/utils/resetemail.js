const  nodemailer = require('nodemailer');




const sendEmail = async (email, subject , html) => {

let transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
          user: 'laroussilina056@gmail.com',
          pass: 'vumt qaak obog xlfr'
      }
}); 


const mailOptions = {
    from: 'laroussilina056@gmail.com',
    to: email,
    subject: subject,
    html: html,
  };
  
  // Send email
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.error('Error occurred:', error);
    } else {
      console.log('Email sent:', info.response);
    }
});}




module.exports = sendEmail;