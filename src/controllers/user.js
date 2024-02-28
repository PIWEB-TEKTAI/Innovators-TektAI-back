const User = require('../models/user')
const { StatusCodes } = require('http-status-codes')
const { BadRequestError, NotFoundError, UnauthenticatedError } = require('../errors')
const sendEmail = require('../utils/sendEmail')
const Token = require('../models/token')
const crypto = require('crypto')
require('dotenv').config();

const register = async (req,res) =>{

    const { companyName,companyAddress,companyPhone,companyEmail,companyProfessionnalFields } = req.body


    req.body.isEmailVerified = false;

    

    const existingEmail = await User.findOne({ email: req.body.email })
    const existingEmailCompany = await User.findOne({ "company.email": req.body.companyEmail })
    if (existingEmail || (existingEmailCompany && existingEmailCompany.company.email !== '')) {
        res.status(400).json({msg: "This email address is already in use. Please use a different email."});

    }else{
        const user = new User ({
            ...req.body,
            company: { 
                name: companyName,
                address: companyAddress,
                phone: companyPhone,
                email: companyEmail,
                professionnalFields: companyProfessionnalFields
              }
        })

        const createdUser = user.save();
        if(createdUser){
            const token = await Token.create({ userId: user._id, token: crypto.randomBytes(120).toString('hex') });

            const link = `http://localhost:5173/auth/verifyEmail/${token.token}/${token.userId}`;
            sendEmail(req.body.email , "Please confirm your Email address" , "Hello,<br> Please Click on the link to verify your email.<br><a href="+ link +">Click here to verify</a>")
            res.status(StatusCodes.CREATED).json({ msg: "Your registration is successful, Please check your email to verify your email" })
        }else{
            res.status(500).json( {msg :"Error Submitting data"})
        }
    }
}


const emailVerification = async(req,res)=>{

    const userId = req.params.id
    const token = await Token.findOne({ token:req.params.token  })
    if (!token){
            return res.status(400).send({msg:'Your verification link may have expired. Please click on resend for verify your Email.'});
    }
    const user = await User.findByIdAndUpdate({ _id: userId },{isEmailVerified:true},{ new:true ,runValidators: true })
    if(!user){
        return res.status(401).send({msg:'We were unable to find a user for this verification. Please SignUp!'});
    } 
    return res.status(200).send({msg:'your account has been successfully verified'}) 
}
















module.exports = {
   register,
   emailVerification
}





