const User = require('../models/User')
const Notification = require('../models/notifications');
const { StatusCodes } = require('http-status-codes')
const { BadRequestError, NotFoundError, UnauthenticatedError } = require('../errors')
const sendEmail = require('../utils/sendEmail')
const Token = require('../models/token')
const crypto = require('crypto')
const resetemail = require('../utils/resetemail');
const contactemail = require('../utils/contactemail');

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();
const { getSocketInstance } = require('../../socket');


function generateVerificationCode() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

const register = async (req,res) =>{

    const { companyName,companyAddress,companyEmail } = req.body
    req.body.isEmailVerified = false;

    const salt =await bcrypt.genSalt(10)
    const cryptedPassword= await bcrypt.hash(req.body.password, salt)
    
    const existingEmail = await User.findOne({ email: req.body.email })
    const existingEmailCompany = await User.findOne({ "company.email": req.body.companyEmail })
    if (existingEmail || (existingEmailCompany && existingEmailCompany.company.email !== '')) {
        res.status(400).json({msg: "This email address is already in use. Please use a different email."});

    }else{
        const user = new User ({
            ...req.body,
            password:cryptedPassword,
            company: { 
                name: companyName,
                address: companyAddress,
                email: companyEmail,
              }
        })
        if (req.body.role === 'challenger') {
          user.AlreadyCompany = false
        }else if (req.body.role === 'company') {
          user.AlreadyCompany = true
        } 
        const createdUser = user.save();
        if(createdUser){
          try{
            const io = getSocketInstance();
            const verificationCode = generateVerificationCode();
            const token = await Token.create({ userId: user._id, token:verificationCode});            
            const template = 'emailVerification'            
            await sendEmail(req.body.email , "Please confirm your Email address",template , verificationCode , req.body.FirstName , req.body.LastName)
            await io.emit('newUserRegistered', { firstname:user.FirstName , lastname:user.LastName }); 
            const notifications = await Notification.create({
                title:"User Registration",
                content:"has create an account",
                createdAccountUserId:user._id,
                isAdminNotification:true
            })
            res.status(StatusCodes.CREATED).json({ msg: "Your registration is successful, Please check your email to verify your email" , data:{ id:user._id } })
          }catch(error){
             res.status(500).json( {msg :"Error Submitting data"})
          }
        }else{
            res.status(500).json( {msg :"Error Submitting data"})
        }
    }
}


const emailVerification = async(req,res)=>{

    const id = req.params.id
    const token = await Token.findOne({ userId:id, token: req.body.token})
    if (!token){
            return res.status(400).send({msg:'Your verification code may have been expired.'});
    }
    const user = await User.findByIdAndUpdate({ _id: token.userId },{isEmailVerified:true},{ new:true ,runValidators: true })
    if(!user){
        return res.status(401).send({msg:'We were unable to find a user for this verification. Please SignUp!'});
    } 
    return res.status(200).send({msg:'your account has been successfully verified'}) 
}


const resendEmailVerification = async(req,res)=>{

    const userId  = req.params.id

    const user = await User.findOne({_id: userId })

    if(!user){
        return res.status(401).send({msg:'We were unable to find a user for this verification. Please SignUp!'});
    } 

    if(user.isEmailVerified == true){
        return res.status(401).send({msg:'The email address is already verified!'});
    }

    const oldVerificationCodes = await Token.deleteMany({userId:userId})

    if(oldVerificationCodes){

      const verificationCode = generateVerificationCode();
      const token = await Token.create({ userId: user._id, token:verificationCode});            
      const template = 'emailVerification'
             
      await sendEmail(user.email , "Please confirm your Email address", template , verificationCode , user.FirstName , user.LastName)
  
      res.status(StatusCodes.OK).json({msg:'we have sent the verification code successfully'});
    }
}


const resendEmailVerificationAfterSignIn = async(req,res)=>{

  const email  = req.body.email

  const user = await User.findOne({email: email })

  if(!user){
      return res.status(401).send({msg:'We were unable to find a user for this verification. Please SignUp!'});
  } 

  const oldVerificationCodes = await Token.deleteMany({userId:user._id})

  if(oldVerificationCodes){

    const verificationCode = generateVerificationCode();
    const token = await Token.create({ userId: user._id, token:verificationCode});            
    const template = 'emailVerification'
           
    await sendEmail(user.email , "Please confirm your Email address", template , verificationCode , user.FirstName , user.LastName)

    res.status(StatusCodes.OK).json({msg:'we have sent the verification code successfully',data:{ id:user._id } });
  }
}



const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.send({ Status: "User not existed" });
    }
    const token = jwt.sign({ id: user._id }, "jwt_secret_key", { expiresIn: "1h" });
    const resetPasswordLink = `http://localhost:5173/auth/resetPassword/${user._id}/${token}`;
    const template = 'emailresetpassword';
    resetemail(user.email, 'Reset Password Link', template , resetPasswordLink, user.FirstName, user.LastName)
      .then(() => res.send({ Status: "Success" }))
      .catch(error => res.status(500).json({ Status: "Error sending email", error }));
  } catch (error) {
    console.error('Error finding user:', error);
    res.status(500).json({ Status: "Internal Server Error" });
  }
};


const resetPassword = async (req, res) => {
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

    // Save the new password and update the previous passwords list
    user.previousPasswords.push(user.password);
    user.password = hashedPassword;
    await user.save();

    return res.json({ Status: "Success" });
  } catch (error) {
    console.error('Error resetting password:', error);
    return res.status(500).json({ Status: "Internal Server Error" });
  }
};

const sendContactEmail = async (req, res) => {
  const { email, message } = req.body;
  const subject = 'Contact Form Submission';

  try {
      const result = await contactemail(subject , email , message ); // Use contactemail function
      if (result.status === 'success') {
          res.status(200).json({ message: 'Email sent successfully!' });
      } else {
          res.status(500).json({ error: 'Failed to send email. Please try again later.' });
      }
  } catch (error) {
      console.error('Error sending email:', error);
      res.status(500).json({ error: 'Failed to send email. Please try again later.' });
  }
};






module.exports = {
   register,
   emailVerification,
   resendEmailVerification,
   forgotPassword,
   resetPassword,
   sendContactEmail,
   resendEmailVerificationAfterSignIn
}





