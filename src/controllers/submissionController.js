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
            title:req.body.title
            
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
exports.getSubmissionsByChallengeId = async (req, res) => {
    const { challengeId } = req.params;
  
    try {
      const submissions = await Submission.find({ challengeId });
  
      if (!submissions || submissions.length === 0) {
        return res.status(404).json({ message: 'No submissions found for this challenge ID' });
      }
  
      res.status(200).json(submissions);
    } catch (error) {
      console.error('Error retrieving submissions:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };

  exports.viewDetailssubmission = async (req, res) => {
    const submissionId = req.params.id;
         
  
    try {
        const submission = await Submission.findById(submissionId).populate('submittedBy'); 

         console.log(submission)
        if (!submission) {
            return res.status(404).json({ message: 'submission not found' });
        }
  
        return res.status(200).json(submission);
    } catch (error) {
        console.error('Error retrieving submission details:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
  };
  

