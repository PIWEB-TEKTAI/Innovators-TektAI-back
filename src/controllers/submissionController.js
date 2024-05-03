// Import Submission model
const Submission = require("../models/submission");
const Challenge = require("../models/challenge");
const Notification = require("../models/notifications");
const User = require("../models/User");

const { getSocketInstance } = require("../../socket");
const Team = require("../models/team");

exports.updateSubmissionScore = async (req, res) => {
  try {
    const { id } = req.params; 
    const { score } = req.body; 

    const submission = await Submission.findById(id);

    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    submission.status = "approved";
    submission.score = score;

    await submission.save();

    res.status(200).json(submission);
  } catch (error) {
    console.error('Error updating submission score:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};


exports.addSubmission = async (req, res) => {
  try {
    const io = getSocketInstance();
    const challengeId = req.params.challengeId;
    const type = req.body.type;
    const teamId = req.body.teamId;
  
    let newSubmission = new Submission({
      challengeId,
      submittedBy: req.user.id,
      submissionDate: new Date(),
      description: req.body.description,
      title: req.body.title,
      output:req.body.output,
    });
    if(type=="team"){
      newSubmission = new Submission({
        challengeId,
        submittedBy: req.user.id,
        submittedByTeam: teamId,
        submissionDate: new Date(),
        description: req.body.description,
        title: req.body.title,
        output:req.body.output,
      });
    }
    if (req.files && Object.keys(req.files).length > 0) {
      Object.keys(req.files).forEach(key => {

        const file = req.files[key];

        if(file.fieldname && file.fieldname === 'datasetFile'){
          const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${
            file.filename
          }`;
          newSubmission.datasetFile = {
            name:file.filename,
            url:fileUrl
          }

        }else if(file.fieldname && file.fieldname === 'presentationFile'){
          const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${
            file.filename
          }`;
          newSubmission.presentationFile = {
            name:file.filename,
            url:fileUrl
          }
        }else if(file.fieldname && file.fieldname === 'codeSourceFile'){
          const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${
            file.filename
          }`;
          newSubmission.codeSourceFile = {
            name:file.filename,
            url:fileUrl
          }
        }else if(file.fieldname && file.fieldname === 'reportFile'){
          const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${
            file.filename
          }`;
          newSubmission.reportFile = {
            name:file.filename,
            url:fileUrl
          }
        }else if(file.fieldname && file.fieldname === 'demoFile'){
          const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${
            file.filename
          }`;
          newSubmission.demoFile = {
            name:file.filename,
            url:fileUrl
          }
        }else if(file.fieldname && file.fieldname === 'readMeFile'){
          const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${
            file.filename
          }`;
          newSubmission.readMeFile = {
            name:file.filename,
            url:fileUrl
          }
        }
      });
    }
    const challenger = await User.findById(newSubmission.submittedBy);
    const team = await Team.findById(teamId);

    const challenge = await Challenge.findById(challengeId);

    await newSubmission.save();
     
    if(type=="team"){
      await io.emit("newTeamSubmission", {
        name:team.name,
        idUser: challenge.createdBy,
        content: "has added a solution to your competition",
      });
      const notifications = await Notification.create({
        title: "TeamSubmission added",
        content: "has added a solution to your competition",
        recipientUserId: challenge.createdBy,
        TeamConcernedId: team._id,
        SubmittionConcernedId:newSubmission._id,
        isAdminNotification: false,
      });
    }else{

    await io.emit("newSubmission", {
      firstname: challenger.FirstName,
      lastname: challenger.LastName,
      idUser: challenge.createdBy,
      content: "has added a solution to your competition",
    });
    const notifications = await Notification.create({
      title: "Submission added",
      content: "has added a solution to your competition",
      recipientUserId: challenge.createdBy,
      UserConcernedId: req.user.id,
      SubmittionConcernedId:newSubmission._id,
      isAdminNotification: false,
    });
  }
    res
      .status(201)
      .json({ success: true, message: "Submission added successfully" });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to add submission",
        error: error.message,
      });
  }
};

exports.getSubmissionById = async (req, res) => {
  try {
    const submissionId = req.params.id;
   const submission = await Submission.findById(submissionId).populate('submittedBy').populate('challengeId');
    if (!submission) {
      return res.status(404).send({ message: "Submittion not found" });
    }

    return res.status(200).send({ submission });
  } catch (error) {
    console.error("Error finding submission by ID:", error);
    return res.status(500).send({ message: "Internal Server Error" });
  }
};

exports.editSubmission = async (req, res) => {
  try {
    const io = getSocketInstance();

    const submissionId = req.params.id;

    const existingSubmission = await Submission.findById(submissionId);
    if (!existingSubmission) {
      return res
        .status(404)
        .json({ success: false, message: "Submission not found" });
    }

    existingSubmission.description = req.body.description;
    existingSubmission.title = req.body.title;
    existingSubmission.output = req.body.output;


    if (req.files && Object.keys(req.files).length > 0) {
      Object.keys(req.files).forEach(key => {

        const file = req.files[key];

        if(file.fieldname && file.fieldname === 'datasetFile'){
          const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${
            file.filename
          }`;
          existingSubmission.datasetFile = {
            name:file.filename,
            url:fileUrl
          }

        }else if(file.fieldname && file.fieldname === 'presentationFile'){
          const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${
            file.filename
          }`;
          existingSubmission.presentationFile = {
            name:file.filename,
            url:fileUrl
          }
        }else if(file.fieldname && file.fieldname === 'codeSourceFile'){
          const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${
            file.filename
          }`;
          existingSubmission.codeSourceFile = {
            name:file.filename,
            url:fileUrl
          }
        }else if(file.fieldname && file.fieldname === 'reportFile'){
          const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${
            file.filename
          }`;
          existingSubmission.reportFile = {
            name:file.filename,
            url:fileUrl
          }
        }else if(file.fieldname && file.fieldname === 'demoFile'){
          const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${
            file.filename
          }`;
          existingSubmission.demoFile = {
            name:file.filename,
            url:fileUrl
          }
        }else if(file.fieldname && file.fieldname === 'readMeFile'){
          const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${
            file.filename
          }`;
          existingSubmission.readMeFile = {
            name:file.filename,
            url:fileUrl
          }
        }
      });
    }

    const challenger = await User.findById(existingSubmission.submittedBy);

    const challenge = await Challenge.findById(existingSubmission.challengeId);

    await existingSubmission.save();

    await io.emit("editSubmission", {
      firstname: challenger.FirstName,
      lastname: challenger.LastName,
      idUser: challenge.createdBy,
      content: "has edited his solution",
    });
    const notifications = await Notification.create({
      title: "Submission edit",
      content: "has edited his solution",
      recipientUserId: challenge.createdBy,
      UserConcernedId: req.user.id,
      SubmittionConcernedId:submissionId,
      isAdminNotification: false,
    });

    res
      .status(200)
      .json({ success: true, message: "Submission updated successfully" });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to update submission",
        error: error.message,
      });
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

exports.getListChallengeChallenger = async (req, res) => {
  const userId = req.user.id;
  console.log(userId);

  try {
    const team = await Team.find({
      $or: [
        { members: { $in: [userId] } }, 
        { leader: userId } 
      ]
    });

    const teamIds = team.map(team => team._id);

    const challenges = await Challenge.find({
      $or:[
        {"participations.soloParticipants": { $in: [userId] }},
        {"participations.TeamParticipants": { $in: teamIds }}
      ]
    });

    if (!challenges || challenges.length === 0) {
      return res
        .status(404)
        .json({ message: "No challenges found for this user ID" });
    }
    console.log(challenges);
    res.status(200).json(challenges);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

exports.getSubmissionsByChallengeId = async (req, res) => {
  const { challengeId } = req.params;

  try {
    const submissions = await Submission.find({ challengeId }).populate('submittedBy').populate('submittedByTeam');
    if (!submissions || submissions.length === 0) {
      return res
        .status(404)
        .json({ message: "No submissions found for this challenge ID" });
    }

    res.status(200).json(submissions);
  } catch (error) {
    console.error("Error retrieving submissions:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.DeleteSubmission = async (req, res) => {
  const id = req.params.id;

  try {
    const submission = await Submission.deleteOne({ _id: id });

    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }
    res.status(201).json({ msg: "Submission deleted successfully" });
  } catch (error) {
    console.error("Error deleting Submission :", error);
    res
      .status(500)
      .json({ msg: "An error occurred while deleting Submission" });
  }
};
  exports.AllSubmissions= async (req,res) =>{
    try {
        const submission = await Submission.find();
    
    
        if (! submission||  submission.length === 0) {
          return res.status(404).json({ message: 'Aucun Submission trouver ' });
        }
    
        res.status(200).json(submission);
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
      }
};
exports.SubmissionsByIdChallenge= async (req,res) =>{
  try {
      var id = req.params.id;
      const submission = await Submission.find({challengeId:id});
  
  
      if (! submission||  submission.length === 0) {
        return res.status(404).json({ message: 'Aucun Submission trouver ' });
      }
  
      res.status(200).json(submission);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erreur serveur' });
    }
};
exports.SubmissionsDetails= async (req,res) =>{
    try {
        var id = req.params.id;
        const submission = await Submission.findById(id);
    
    
        if (! submission||  submission.length === 0) {
          return res.status(404).json({ message: 'Aucun Submission trouver ' });
        }
    
        res.status(200).json(submission);
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
      }
  };

