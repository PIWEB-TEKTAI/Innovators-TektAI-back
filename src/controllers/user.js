const User = require('../models/user')
const { StatusCodes } = require('http-status-codes')
const { BadRequestError, NotFoundError, UnauthenticatedError } = require('../errors')


const register = async (req,res) =>{

    const { companyName,companyAddress,companyPhone,companyEmail,companyProfessionnalFields } = req.body


    req.body.isEmailVerified = false;

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

    user.save()
        .then( 
            ()  => 
            res.status(StatusCodes.CREATED)
            .json({msg:"Your registration is successful, Please check your gmail to verify your email" }))
       
}
















module.exports = {
   register
}





