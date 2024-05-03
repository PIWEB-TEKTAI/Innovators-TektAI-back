const nodemailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars');
const path = require('path');

const contactemail = async (subject  , email , message ) => {
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
    

    transporter.use('compile', hbs(handlebarOptions));

    // Define mail options
    let mailOptions = {
        from:  'tektaitektai7@gmail.com', // Use the fromEmail parameter dynamically
        to: 'tektaitektai7@gmail.com',
        subject: subject,
        template: 'contactemail',
        context: {
            email:email,
            message: message,
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



module.exports = contactemail;
