const express = require('express');
const connectDB = require('./src/configs/db');
const cors = require('cors'); // Import the cors package
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const User = require('./src/models/User'); // Import the User model
const resetemail = require('./src/utils/resetemail');

dotenv.config();

const app = express();
const server = require('http').createServer(app);

app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173' , // Replace with your React app's URL
  credentials: true
}));
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/forgotPassword', (req, res) => {
  const {email} = req.body;
  User.findOne({email: email})
  .then(user => {
      if(!user) {
          return res.send({Status: "User not existed"})
      } 
      const token = jwt.sign({id: user._id}, "jwt_secret_key", {expiresIn: "1d"})
        const resetPasswordLink = `http://localhost:5173/auth/resetPassword/${user._id}/${token}`;
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
        
        <body style="background-color: #ffffff; margin: 0; padding: 0; -webkit-text-size-adjust: none; text-size-adjust: none;">
          <table class="nl-container" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #ffffff;">
            <tbody>
              <tr>
                <td>
                  <table class="row row-1" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                    <tbody>
                      <tr>
                        <td>
                          <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #ffffff; color: #000000; width: 550px; margin: 0 auto;" width="550">
                            <tbody>
                              <tr>
                                <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                  <table class="image_block block-1" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                    <tr>
                                      <td class="pad" style="width:100%;">
                                        <div class="alignment" align="center" style="line-height:10px">
                                          <div style="max-width: 243px;"><a href="www.example.com" target="_blank" style="outline:none" tabindex="-1"><img src="https://661d91e324.imgdist.com/pub/bfra/5zul8bis/3g0/21n/sj9/logo.png" style="display: block; height: auto; border: 0; width: 100%;" width="243"></a></div>
                                        </div>
                                      </td>
                                    </tr>
                                  </table>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <table class="row row-2" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                    <tbody>
                      <tr>
                        <td>
                          <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #cbb9ff; color: #000000; width: 550px; margin: 0 auto;" width="550">
                            <tbody>
                              <tr>
                                <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 5px; padding-top: 5px; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                  <table class="image_block block-1" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                    <tr>
                                      <td class="pad" style="width:100%;">
                                        <div class="alignment" align="center" style="line-height:10px">
                                          <div style="max-width: 550px;"><a href="www.example.com" target="_blank" style="outline:none" tabindex="-1"><img src="https://d1oco4z2z1fhwp.cloudfront.net/templates/default/4056/3275432.png" style="display: block; height: auto; border: 0; width: 100%;" width="550" alt="reset password" title="reset password"></a></div>
                                        </div>
                                      </td>
                                    </tr>
                                  </table>
                                  <div class="spacer_block block-2" style="height:40px;line-height:40px;font-size:1px;">&#8202;</div>
                                  <table class="paragraph_block block-3" width="100%" border="0" cellpadding="10" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                    <tr>
                                      <td class="pad">
                                        <div style="color:#393d47;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:16px;line-height:120%;text-align:center;mso-line-height-alt:19.2px;">
                                          <p style="margin: 0; word-break: break-word;"><span>We received a request to reset your password.</span></p>
                                          <p style="margin: 0; word-break: break-word;"><span>If you didn't make this request, simply ignore this email.</span></p>
                                        </div>
                                      </td>
                                    </tr>
                                  </table>
                                  <table class="button_block block-4" width="100%" border="0" cellpadding="20" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                  <tr>
                                      <td class="pad">
                                          <div class="alignment" align="center">
                                              <!--[if mso]>
                                              <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${resetPasswordLink}" style="height:42px;width:88px;v-text-anchor:middle;" arcsize="58%" stroke="false" fillcolor="#37474f">
                                              <w:anchorlock/>
                                              <v:textbox inset="0px,0px,0px,0px">
                                              <center style="color:#d6f8f2; font-family:Arial, sans-serif; font-size:16px">
                                              <![endif]-->
                                              <a href="${resetPasswordLink}" target="_blank" style="text-decoration:none;display:inline-block;color:#d6f8f2;background-color:#37474f;border-radius:24px;width:auto;border-top:0px solid transparent;font-weight:undefined;border-right:0px solid transparent;border-bottom:0px solid transparent;border-left:0px solid transparent;padding-top:5px;padding-bottom:5px;font-family:'Helvetica Neue', Helvetica, Arial, sans-serif;font-size:16px;text-align:center;mso-border-alt:none;word-break:keep-all;">
                                                  <span style="padding-left:15px;padding-right:15px;font-size:16px;display:inline-block;letter-spacing:1px;">
                                                      <span style="word-break: break-word; line-height: 32px;">
                                                          <strong>RESET</strong>
                                                      </span>
                                                  </span>
                                              </a>
                                              <!--[if mso]></center></v:textbox></v:roundrect><![endif]-->
                                          </div>
                                      </td>
                                  </tr>
                              </table>
                                                      </td>
                      </tr>
                    </tbody>
                  </table>
                  <table class="row row-3" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                    <tbody>
                      <tr>
                        <td>
                          <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #ffffff; color: #000000; width: 550px; margin: 0 auto;" width="550">
                            <tbody>
                              <tr>
                                <td class="column column-1" width="33.333333333333336%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 5px; padding-top: 5px; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                  <div class="spacer_block block-1" style="height:20px;line-height:20px;font-size:1px;">&#8202;</div>
                                  <table class="image_block block-2" width="100%" border="0" cellpadding="25" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                    <tr>
                                      <td class="pad">
                                        <div class="alignment" align="left" style="line-height:10px">
                                          <div style="max-width: 86px;"><a href="www.example.com" target="_blank" style="outline:none" tabindex="-1"><img src="https://661d91e324.imgdist.com/pub/bfra/5zul8bis/rqy/q7z/vyu/logomini-removebg-preview.png" style="display: block; height: auto; border: 0; width: 100%;" width="86" alt="company logo" title="company logo"></a></div>
                                        </div>
                                      </td>
                                    </tr>
                                  </table>
                                  <div class="spacer_block block-3" style="height:20px;line-height:20px;font-size:1px;">&#8202;</div>
                                </td>
                                <td class="column column-2" width="33.333333333333336%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 5px; padding-top: 5px; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                  <div class="spacer_block block-1" style="height:20px;line-height:20px;font-size:1px;">&#8202;</div>
                                  <table class="heading_block block-2" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                    <tr>
                                      <td class="pad" style="padding-left:20px;text-align:center;width:100%;">
                                        <h3 style="margin: 0; color: #37474f; direction: ltr; font-family: Helvetica Neue, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: normal; line-height: 200%; text-align: left; margin-top: 0; margin-bottom: 0; mso-line-height-alt: 32px;"><strong>About Us</strong></h3>
                                      </td>
                                    </tr>
                                  </table>
                                  <table class="divider_block block-3" width="100%" border="0" cellpadding="10" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                    <tr>
                                      <td class="pad">
                                        <div class="alignment" align="left">
                                          <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="80%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                            <tr>
                                              <td class="divider_inner" style="font-size: 1px; line-height: 1px; border-top: 2px solid #BBBBBB;"><span>&#8202;</span></td>
                                            </tr>
                                          </table>
                                        </div>
                                      </td>
                                    </tr>
                                  </table>
                                  <table class="paragraph_block block-4" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                    <tr>
                                      <td class="pad" style="padding-left:10px;padding-right:20px;">
                                        <div style="color:#37474f;font-family:Helvetica Neue, Helvetica, Arial, sans-serif;font-size:11px;line-height:150%;text-align:left;mso-line-height-alt:16.5px;">
                                          <p style="margin: 0; word-break: break-word;"><span>Transforming Challenges Into Solutions</span></p>
                                          <p style="margin: 0;">Welcome to our collaborative data science platform, where industry challenges meet innovative solutions. <span></span></p>
                                        </div>
                                      </td>
                                    </tr>
                                  </table>
                                </td>
                                <td class="column column-3" width="33.333333333333336%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 5px; padding-top: 5px; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                  <div class="spacer_block block-1" style="height:20px;line-height:20px;font-size:1px;">&#8202;</div>
                                  <table class="heading_block block-2" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                    <tr>
                                      <td class="pad" style="padding-left:20px;text-align:center;width:100%;">
                                        <h3 style="margin: 0; color: #37474f; direction: ltr; font-family: Helvetica Neue, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: normal; line-height: 200%; text-align: left; margin-top: 0; margin-bottom: 0; mso-line-height-alt: 32px;"><strong>Contact</strong></h3>
                                      </td>
                                    </tr>
                                  </table>
                                  <table class="divider_block block-3" width="100%" border="0" cellpadding="10" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                    <tr>
                                      <td class="pad">
                                        <div class="alignment" align="left">
                                          <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="80%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                            <tr>
                                              <td class="divider_inner" style="font-size: 1px; line-height: 1px; border-top: 2px solid #BBBBBB;"><span>&#8202;</span></td>
                                            </tr>
                                          </table>
                                        </div>
                                      </td>
                                    </tr>
                                  </table>
                                  <table class="paragraph_block block-4" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                    <tr>
                                      <td class="pad" style="padding-bottom:10px;padding-left:20px;padding-right:20px;padding-top:10px;">
                                        <div style="color:#a9a9a9;font-family:Helvetica Neue, Helvetica, Arial, sans-serif;font-size:14px;line-height:120%;text-align:left;mso-line-height-alt:16.8px;">
                                          <p style="margin: 0; word-break: break-word;"><a href="http://www.example.com" target="_blank" style="text-decoration: none; color: #37474f;" rel="noopener">tektaicontact@tektai.com</a></p>
                                        </div>
                                      </td>
                                    </tr>
                                  </table>
                                  <table class="social_block block-5" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                    <tr>
                                      <td class="pad" style="padding-bottom:10px;padding-left:20px;padding-right:10px;padding-top:10px;text-align:left;">
                                        <div class="alignment" align="left">
                                          <table class="social-table" width="156px" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; display: inline-block;">
                                            <tr>
                                              <td style="padding:0 20px 0 0;"><a href="https://www.facebook.com" target="_blank"><img src="https://app-rsrc.getbee.io/public/resources/social-networks-icon-sets/t-circle-default-gray/facebook@2x.png" width="32" height="32" alt="Facebook" title="facebook" style="display: block; height: auto; border: 0;"></a></td>
                                              <td style="padding:0 20px 0 0;"><a href="https://www.twitter.com" target="_blank"><img src="https://app-rsrc.getbee.io/public/resources/social-networks-icon-sets/t-circle-default-gray/twitter@2x.png" width="32" height="32" alt="Twitter" title="twitter" style="display: block; height: auto; border: 0;"></a></td>
                                              <td style="padding:0 20px 0 0;"><a href="https://www.instagram.com" target="_blank"><img src="https://app-rsrc.getbee.io/public/resources/social-networks-icon-sets/t-circle-default-gray/instagram@2x.png" width="32" height="32" alt="Instagram" title="instagram" style="display: block; height: auto; border: 0;"></a></td>
                                            </tr>
                                          </table>
                                        </div>
                                      </td>
                                    </tr>
                                  </table>
                                  <div class="spacer_block block-6" style="height:20px;line-height:20px;font-size:1px;">&#8202;</div>
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
          </table><!-- End -->
        </body>
        
             </html> `;
    
        
        resetemail(user.email, 'Reset Password Link', emailHtml)
        .then(() => res.send({ Status: "Success" }))
        .catch(error => res.status(500).json({ Status: "Error sending email", error }));
    })
    .catch(error => {
      console.error('Error finding user:', error);
      res.status(500).json({ Status: "Internal Server Error" });
    });
});



app.post('/api/resetPassword/:id/:token', async (req, res) => {
  const { id, token } = req.params;
  const { password } = req.body;

  try {
    // Verify the JWT token
    const decoded = jwt.verify(token, "jwt_secret_key");

    // Find the user by ID
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ Status: "User not found" });
    }

    // Check if the new password matches any of the user's previous passwords
    const passwordMatched = await Promise.all(user.previousPasswords.map(async (prevPassword) => {
      return await bcrypt.compare(password, prevPassword);
    }));

    if (passwordMatched.some(match => match)) {
      return res.status(400).json({ Status: "Cannot reuse previous password, Please try another one" });
    }


    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    user.previousPasswords.push(user.password);
    user.password = hashedPassword;
    await user.save();

    return res.json({ Status: "Success" });
  } catch (error) {
    console.error('Error resetting password:', error);
    return res.status(500).json({ Status: "Internal Server Error" });
  }
});



// Default route
app.use('', async function (req, res) {
  res.json({ message: "la réponse du serveur" });
});

const port = process.env.PORT || 3000;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    server.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();
