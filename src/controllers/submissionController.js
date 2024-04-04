// Import Submission model
const Submission = require('../models/submission')

exports.addSubmission = async (req, res) => {
    try {
        console.log( req.files.file[0])
        challengeId = req.params.challengeId;
        const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${ req.files.file[0].filename}`
        const newSubmission = new Submission({
            challengeId,
            submittedBy:req.user.id,
            submissionDate:new Date(),
            description:req.body.description,
            
            ...req.body,
        });
        newSubmission.files.push({
            name:  req.files.file[0].filename,
            url: fileUrl
          });
      
        await newSubmission.save();

        res.status(201).json({ success: true, message: 'Submission added successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to add submission', error: error.message });
    }
};


