const nodemailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars');
const path = require('path');

function toTitleCase(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
        user: 'tektaitektai7@gmail.com',
        pass: 'jiva rlyt bqba ozzb'
    }
});

// Define Handlebars options
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

// Function to send email
const validateAccountEmail = async (email, subject, template , FirstName, LastName) => {
    const mailOptions = {
        from: 'laroussilina056@gmail.com',
        to: email,
        subject: subject,
        template: template,
        context: {
            FirstName: toTitleCase(FirstName),
            LastName: toTitleCase(LastName),
        }
    };

    // Send email
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.error('Error occurred:', error);
        } else {
            console.log('Email sent:', info.response);
        }
    });
};

module.exports = validateAccountEmail;
