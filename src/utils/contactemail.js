const nodemailer = require('nodemailer');

const contactemail = async (fromEmail, subject, message) => {
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
        from: fromEmail, // Use the fromEmail parameter dynamically
        to: 'gestionstockapii@gmail.com',
        subject: subject,
        text: message
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
