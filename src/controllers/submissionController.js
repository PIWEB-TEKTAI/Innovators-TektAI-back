// Import Submission model
const Submission = require('../models/submission');
const Challenge = require('../models/challenge');


exports.addSubmission = async (req, res) => {
    try {
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

exports.getSubmissionById = async (req, res) => {
  try {
    const submissionId = req.params.id; 
    const submission = await Submission.findById(submissionId);
    if (!submission) {
        return res.status(404).send({ message: 'Submittion not found' });
     }
  
      return res.status(200).send({ submission });
    } catch (error) {
      console.error('Error finding submission by ID:', error);
      return res.status(500).send({ message: 'Internal Server Error' });
    }
};


exports.editSubmission = async (req, res) => {
  try {

      const submissionId = req.params.id;

      const existingSubmission = await Submission.findById(submissionId);
      if (!existingSubmission) {
          return res.status(404).json({ success: false, message: 'Submission not found' });
      }

      existingSubmission.description = req.body.description;
      existingSubmission.title = req.body.title;

      if (req.files && req.files.file && req.files.file[0].filename) {
          const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.files.file[0].filename}`;
          existingSubmission.files = [{
              name: req.files.file[0].filename,
              url: fileUrl
          }];
      }

      await existingSubmission.save();

      res.status(200).json({ success: true, message: 'Submission updated successfully' });
  } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to update submission', error: error.message });
  }
};


/*exports.getListChallengeChallenger = async (req,res) =>{
  const userId = req.user.id; 
  console.log(userId);

  try {
    const submissions = await Submission.find({ submittedBy: userId }).populate('challengeId');

    const challengeIds = submissions.map(submission => submission.challengeId);

    const challenges = await Challenge.find({ _id: { $in: challengeIds } });

    res.status(200).json(challenges);
   
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
}
*/

exports.getListChallengeChallenger = async (req,res) =>{
  const userId = req.user.id; 
  console.log(userId);

  try {
    const challenges = await Challenge.find({ "participations.soloParticipants": { $in: [userId] } });
    if (!challenges || challenges.length === 0) {
      return res.status(404).json({ message: 'No challenges found for this user ID' });
    }
    console.log(challenges);
    res.status(200).json(challenges);
   
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
}


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


exports.DeleteSubmission = async (req,res) =>{

    const id = req.params.id
  
    try {
        const submission = await Submission.deleteOne({_id:id});
  
        if (!submission) {
          return res.status(404).json({ message: 'Submission not found'});
        }
        res.status(201).json({ msg: "Submission deleted successfully" });
      } catch (error) {
        console.error('Error deleting Submission :', error);
        res.status(500).json({ msg: "An error occurred while deleting Submission" });
      }
  }
  exports.AllSubmissions= async (req,res) =>{
    try {
        const Submission = await Submission.find();
    
    
        if (! Submission||  Submission.length === 0) {
          return res.status(404).json({ message: 'Aucun Submission trouver ' });
        }
    
        res.status(200).json(Submission);
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
      }
};
exports.SubmissionsByIdChallenge= async (req,res) =>{
  try {
      var id = req.params.id;
      const Submission = await Submission.find({challengeId:id});
  
  
      if (! Submission||  Submission.length === 0) {
        return res.status(404).json({ message: 'Aucun Submission trouver ' });
      }
  
      res.status(200).json(Submission);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erreur serveur' });
    }
};
exports.SubmissionsDetails= async (req,res) =>{
    try {
        var id = req.params.id;
        const Submission = await Submission.findById(id);
    
    
        if (! Submission||  Submission.length === 0) {
          return res.status(404).json({ message: 'Aucun Submission trouver ' });
        }
    
        res.status(200).json(Submission);
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
      }
  };

