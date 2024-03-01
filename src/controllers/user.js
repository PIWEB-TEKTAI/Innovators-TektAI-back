const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const nodemailer = require('nodemailer');

const user = {};

user.forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.send({ status: "User not existed" });
        }
        const token = jwt.sign({ id: user._id }, "jwt_secret_key", { expiresIn: "1d" });
        const resetPasswordLink = `http://localhost:5173/auth/resetPassword/${user._id}/${token}`;
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'gestionstockapii@gmail.com',
                pass: 'dhxo jaxk ewnv xsyr'
            }
        });
        const emailHtml = `
        <!DOCTYPE html>
        <html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en">

        <head>
            <title></title>
            <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0"><!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch><o:AllowPNG/></o:OfficeDocumentSettings></xml><![endif]--><!--[if !mso]><!--><!--<![endif]-->
            <style>
                * {
                    box-sizing: border-box;
                }

                body {
                    margin: 0;
                    padding: 0;
                }

                a[x-apple-data-detectors] {
                    color: inherit !important;
                    text-decoration: inherit !important;
                }

                #MessageViewBody a {
                    color: inherit;
                    text-decoration: none;
                }

                p {
                    line-height: inherit
                }

                .desktop_hide,
                .desktop_hide table {
                    mso-hide: all;
                    display: none;
                    max-height: 0px;
                    overflow: hidden;
                }

                .image_block img+div {
                    display: none;
                }

                @media (max-width:665px) {

                    .desktop_hide table.icons-inner,
                    .social_block.desktop_hide .social-table {
                        display: inline-block !important;
                    }

                    .icons-inner {
                        text-align: center;
                    }

                    .icons-inner td {
                        margin: 0 auto;
                    }

                    .mobile_hide {
                        display: none;
                    }

                    .row-content {
                        width: 100% !important;
                    }

                    .stack .column {
                        width: 100%;
                        display: block;
                    }

                    .mobile_hide {
                        min-height: 0;
                        max-height: 0;
                        max-width: 0;
                        overflow: hidden;
                        font-size: 0px;
                    }

                    .desktop_hide,
                    .desktop_hide table {
                        display: table !important;
                        max-height: none !important;
                    }
                }
            </style>
        </head>

        <body style="background-color: #37474f; margin: 0; padding: 0; -webkit-text-size-adjust: none; text-size-adjust: none;">
            <table class="nl-container" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #37474f;">
                <tbody>
                    <tr>
                        <td>
                            <table class="row row-1" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                <tbody>
                                    <tr>
                                        <td>
                                            <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #ffffff; color: #000000; width: 645px; margin: 0 auto;" width="645">
                                                <tbody>
                                                    <tr>
                                                        <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                                            <table class="image_block block-1" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                                <tbody class="image_block">
                                                                    <tr>
                                                                        <td class="image_block" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; padding: 0px;">
                                                                            <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                                                <tbody>
                                                                                    <tr>
                                                                                        <td style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; padding-top: 20px; padding-right: 30px; padding-bottom: 0px; padding-left: 30px; color: #000000; font-family: Arial, sans-serif; font-size: 16px; font-weight: 400; line-height: 1.6; text-align: left; word-break: break-word;">
                                                                                            <div style="font-size: 16px; font-weight: 400; line-height: 1.6; color: #000000; mso-line-height-rule: exactly; word-wrap: break-word;">
                                                                                                <p style="font-size: 20px; font-weight: 700; line-height: 1.2; mso-line-height-rule: exactly; margin-top: 0px; margin-bottom: 0px; text-align: center;">Reset Your Password</p>
                                                                                            </div>
                                                                                        </td>
                                                                                    </tr>
                                                                                </tbody>
                                                                            </table>
                                                                        </td>
                                                                    </tr>
                                                                </tbody>
                                                            </table>
                                                            <table class="text_block block-2" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                                <tbody class="text_block">
                                                                    <tr>
                                                                        <td class="text_block" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; padding: 20px;">
                                                                            <div style="font-size: 16px; font-weight: 400; line-height: 1.6; color: #000000; mso-line-height-rule: exactly; word-wrap: break-word;">
                                                                                <p style="font-size: 16px; font-weight: 400; line-height: 1.6; margin-top: 0px; margin-bottom: 20px; text-align: left;">Hello ${user.name},</p>
                                                                                <p style="font-size: 16px; font-weight: 400; line-height: 1.6; margin-top: 0px; margin-bottom: 20px; text-align: left;">We have received a request to reset the password associated with this email account. If you made this request, please click the button below to reset your password.</p>
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                </tbody>
                                                            </table>
                                                            <table class="button_block" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                                <tbody>
                                                                    <tr>
                                                                        <td class="button_block" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; padding: 0px;">
                                                                            <table class="mobile_hide" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                                                <tbody>
                                                                                    <tr>
                                                                                        <td style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-radius: 4px; background-color: #ff9900; text-align: center;" bgcolor="#ff9900">
                                                                                            <a href="${resetPasswordLink}" target="_blank" style="display: inline-block; color: #ffffff; background-color: #ff9900; border: solid 1px #ff9900; border-radius: 4px; box-shadow: 0px 2px 3px rgba(0, 0, 0, 0.16); -webkit-text-size-adjust: none; text-size-adjust: none; font-size: 16px; font-weight: 700; line-height: 40px; text-decoration: none; width: auto; padding: 0 20px;">Reset Password</a>
                                                                                        </td>
                                                                                    </tr>
                                                                                </tbody>
                                                                            </table>
                                                                        </td>
                                                                    </tr>
                                                                </tbody>
                                                            </table>
                                                            <table class="text_block block-2" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                                <tbody class="text_block">
                                                                    <tr>
                                                                        <td class="text_block" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; padding: 20px;">
                                                                            <div style="font-size: 16px; font-weight: 400; line-height: 1.6; color: #000000; mso-line-height-rule: exactly; word-wrap: break-word;">
                                                                                <p style="font-size: 16px; font-weight: 400; line-height: 1.6; margin-top: 0px; margin-bottom: 20px; text-align: left;">If you did not request to reset your password, you can safely ignore this email. Your password will not be changed.</p>
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                </tbody>
                                                            </table>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </td>
                    </tr>
                </tbody>
            </table>
        </body>

        </html>
        `;
        var mailOptions = {
            from: 'gestionstockapii@gmail.com',
            to: email,
            subject: 'Reset your password',
            html: emailHtml
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });

        return res.send({ status: "success" });
    } catch (err) {
        console.error(err.message);
        return res.status(500).send("Server Error");
    }
};

user.resetPassword = async (req, res) => {
    const { id, token } = req.params;
    const { newPassword } = req.body;
    try {
        const decoded = jwt.verify(token, "jwt_secret_key");
        const user = await User.findOne({ _id: id });
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();
        return res.send({ status: "success" });
    } catch (err) {
        console.error(err.message);
        if (err.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Token expired" });
        } else if (err.name === "JsonWebTokenError") {
            return res.status(401).json({ message: "Invalid token" });
        }
        return res.status(500).send("Server Error");
    }
};
module.exports = user;
