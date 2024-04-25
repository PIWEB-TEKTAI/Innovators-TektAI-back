const User = require('../models/User');
const Challenge = require('../models/challenge');
const { getSocketInstance } = require('../../socket');
const Notification = require('../models/notifications');
const Discussion = require('../models/discussion');
const Team = require('../models/team');


exports.editChallenge = async (req, res) => {
    try {

    const challenge = await Challenge.findById({_id:req.params.id});

    let imageUrl;
    let fileUrl;
    if (req.files && Object.keys(req.files).length > 0) {
      Object.keys(req.files).forEach(key => {

        const files = req.files[key];
        files.forEach(file => {
          console.log(file)
          if (file.mimetype.startsWith('image')) {
            imageUrl = `${file.filename}`;
          } else {
            fileUrl = `${file.filename}`;
          }
        });
        req.body.fileUrl = fileUrl;
        req.body.image = imageUrl;
      });
    }else {
      req.body.fileUrl = challenge.fileUrl;
      req.body.image = challenge.image
    }

    /*if(req.file){
        const fileUrl = req.file
        ? {
         fileUrl: `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`,
       }
       :null;  
        req.body.dataset.fileUrl = fileUrl.fileUrl;
     }  else {
        req.body.dataset.fileUrl = challenge.dataset.fileUrl
     }*/
     
      const updateData = {
        ...req.body
      };
  
  
      const updatedChallenge = await Challenge.findOneAndUpdate(
        { _id: req.params.id },
        updateData,
        { new: true }
      );
  
      if (!updatedChallenge) {
        return res.status(404).json({ error: 'Challenge not found' });
      }
  
      res.status(200).json(updatedChallenge);
    } catch (error) {
      console.error('Error editing challenge:', error);
      res.status(500).json({ error: 'Failed to edit challenge' });
    }
};



exports.getChallengeById = async (req, res) => {
    try {
      const challengeId = req.params.id; 
      const challenge = await Challenge.findById(challengeId)    
      .populate('participations.TeamParticipants')
      .populate('participations.TeamParticipationRequests')
      .exec();
      if (!challenge) {
          return res.status(404).send({ message: 'Challenge not found' });
       }
    
        return res.status(200).send({ challenge });
      } catch (error) {
        console.error('Error finding challenge by ID:', error);
        return res.status(500).send({ message: 'Internal Server Error' });
      }
};
  
exports.addChallenge = async (req, res) => {
  try {     
    let imageUrl;
    let fileUrl;
    if (req.files && Object.keys(req.files).length > 0) {
      Object.keys(req.files).forEach(key => {

        const files = req.files[key];
        files.forEach(file => {
          console.log(file)
          if (file.mimetype.startsWith('image')) {
            imageUrl = `${file.filename}`;
          } else {
            fileUrl = `${file.filename}`;
          }
        });
      });
    }
    console.log("file" + fileUrl)
    req.body.fileUrl = fileUrl;
    req.body.image = imageUrl;
    const challengeData = {
      ...req.body,
      createdBy: req.user.id // Assuming req.user.id contains the ID of the logged-in user
    };

    console.log(challengeData)
    const newChallenge = new Challenge(challengeData);
    const savedChallenge = await newChallenge.save();

    // Respond with the saved challenge
    res.status(201).json(savedChallenge);
  } catch (error) {
    console.error('Error adding challenge:', error);
    // Respond with an error status and message
    res.status(500).json({ error: 'Failed to add challenge' });
  }
};


exports.viewDetailschallenge = async (req, res) => {
  const challengeId = req.params.id;
       

  try {
      const challenge = await Challenge.findById(challengeId).populate('createdBy')
      .populate({
        path: 'participations.TeamParticipationRequests',
        populate: {
          path: 'members leader', 
        },
      })
      .populate({
        path: 'participations.TeamParticipants',
        populate: {
          path: 'members leader', 
        },
      });; 


      if (!challenge) {
          return res.status(404).json({ message: 'Challenge not found' });
      }

      return res.status(200).json(challenge);
  } catch (error) {
      console.error('Error retrieving challenge details:', error);
      return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.ChallengesStatics = async (req, res) => {
  try {
      const challenges = await Challenge.find();
      const users = await User.find();

      const totalChallenges = challenges.length;
      const openChallenges = challenges.filter(challenge => challenge.status === 'open').length;
      const completedChallenges = challenges.filter(challenge => challenge.status === 'completed').length;
      const archivedChallenges = challenges.filter(challenge => challenge.status === 'archived').length;
      const totalUsers= users.length;
      const nbchallengers = users.filter(user => user.role === 'challenger').length;
      const nbcompanies = users.filter(user => user.role === 'company').length;


      return res.status(200).json({
          challenges,
          statistics: {
              totalChallenges,
              openChallenges,
              completedChallenges,
              archivedChallenges,
              totalUsers,
              nbchallengers,
              nbcompanies

          }
      });
  } catch (error) {
      console.error('Error retrieving challenges:', error);
      return res.status(500).json({ message: 'Internal server error' });
  }
};


exports.addSoloParticipationRequest = async (req, res) => {
  const { challengeId } = req.params;
  const { userId } = req.body;
console.log(userId)
  try {
    const io = getSocketInstance();
    const challenge = await Challenge.findById(challengeId);

    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    if (challenge.participations.soloParticipants.includes(userId)) {
      return res.status(400).json({ message: 'you are  already a participant' });
    }

    if (challenge.participations.soloParticipationRequests.some(request => request.toString() === userId)) {
      return res.status(400).json({ message: 'you have  already requested to participate' });
    }
    /*const teams = await Team.find({ $or: [{ leader: userId },
      { members: { $in: [userId] } } ] });
    const teamIds = teams.map(team => team._id);

    if (challenge.participations.TeamParticipationRequests.some(request => teamIds.includes(request.toString()))) {
      return res.status(400).json({ message: 'You are already part of a team that sent a participation request' });
    }
    if (challenge.participations.TeamParticipants.some(request => teamIds.includes(request.toString()))) {
      return res.status(400).json({ message: 'You are already part of a team that has participated' });
    }*/
    const userChallenger = await User.findById(userId);
    challenge.participations.soloParticipationRequests.push( userId );
    await challenge.save();
    await io.emit("newParticipationRequest", { firstname:userChallenger.FirstName , lastname:userChallenger.LastName ,idUser:challenge.createdBy,content:"has sent a participation request"}); 
    const notifications = await Notification.create({
        title:"Participation Request",
        content:"has sent a participation request",
        recipientUserId:challenge.createdBy,
        UserConcernedId:userId,
        isAdminNotification:false
    })

    res.status(200).json({ message: 'Participation request added successfully' });
  } catch (error) {
    console.error('Error adding participation request:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
exports.addTeamParticipationRequest = async (req, res) => {
  const { challengeId ,teamId} = req.params;
  try {

    const io = getSocketInstance();
    const challenge = await Challenge.findById(challengeId);

    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    if (challenge.participations.TeamParticipants.includes(teamId)) {
      return res.status(400).json({ message: 'you are  already a participant' });
    }

    if (challenge.participations.TeamParticipationRequests.some(request => request.toString() === teamId)) {
      return res.status(400).json({ message: 'you have  already requested to participate' });
    }

    challenge.participations.TeamParticipationRequests.push( teamId );

    const team = await Team.findById(teamId);

    await challenge.save();

   /* await io.emit("newParticipationRequestTeam", { name:team.name , idUser:challenge.createdBy , content:"has sent a participation request"}); 
    const notifications = await Notification.create({
        title:"Participation Team Request",
        content:"has sent a participation request",
        recipientUserId:challenge.createdBy,
        UserConcernedId:team._id,
        isAdminNotification:false
    })*/

    res.status(200).json({ message: 'Participation request added successfully' });
  } catch (error) {
    console.error('Error adding participation request:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
exports.getAllParticipations = async (req, res) => {
  const { challengeId } = req.params;

  try {
    const challenge = await Challenge.findById(challengeId).populate('participations.soloParticipants');
    
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    const participations = challenge.participations;
    res.json(participations); 
  } catch (error) {
    console.error('Error retrieving participations:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
exports.acceptParticipation = async (req, res) => {
  const { challengeId, userId } = req.params;
  const type  = req.body.type;
  try {
    const io = getSocketInstance();
    const challenge = await Challenge.findById(challengeId);
    const userCompany = await User.findById(challenge.createdBy);

    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    // Check if the user is in the participation requests
    if(type == "Request"){
      const index = challenge.participations.soloParticipationRequests.findIndex(request => request.toString() === userId);
      if (index === -1) {
        return res.status(404).json({ message: 'User not found in participation requests' });
      }
          // Move user from participation requests to participants
    const user = challenge.participations.soloParticipationRequests.splice(index, 1)[0];
    challenge.participations.soloParticipants.push(user);

    await io.emit("AcceptParticipationRequest", { firstname:userCompany.FirstName , lastname:userCompany.LastName ,idUser:user,content:"has accept your participation request"}); 
    const notifications = await Notification.create({
        title:"Accept Participation Request",
        content:"has accept your participation request",
        recipientUserId:user,
        UserConcernedId:challenge.createdBy,
        isAdminNotification:false
    })

    await challenge.save();

    res.status(200).json({ message: 'Participation request accepted successfully' });
    }else if(type == "TeamRequest"){
      const index = challenge.participations.TeamParticipationRequests.findIndex(request => request.toString() === userId);
      if (index === -1) {
        return res.status(404).json({ message: 'Team not found in participation requests' });
      }
          // Move user from participation requests to participants
    const teamId = challenge.participations.TeamParticipationRequests.splice(index, 1)[0];
      const team = await Team.findById(userId);
    challenge.participations.TeamParticipants.push(team);

    await io.emit("AcceptParticipationRequest", { firstname:userCompany.FirstName , lastname:userCompany.LastName ,idUser:team.leader,content:"has accept your participation request"}); 
    const notifications = await Notification.create({
        title:"Accept Participation Request",
        content:"has accept your participation request",
        recipientUserId:team.leader,
        UserConcernedId:challenge.createdBy,
        isAdminNotification:false
    })

    await challenge.save();

    res.status(200).json({ message: 'Participation request accepted successfully' });
    }
   



  } catch (error) {
    console.error('Error accepting participation request:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


exports.declineParticipation = async (req, res) => {
  const { challengeId, userId } = req.params;

  try {
    const challenge = await Challenge.findById(challengeId);

    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    // Check if the user is in the participation requests
    const index = challenge.participations.soloParticipationRequests.findIndex(request => request.toString() === userId);
    if (index === -1) {
      return res.status(404).json({ message: 'User not found in participation requests' });
    }

    challenge.participations.soloParticipationRequests.splice(index, 1)[0];

    await challenge.save();

    res.status(200).json({ message: 'Participation request declined successfully' });
  } catch (error) {
    console.error('Error declining participation request:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.likeDiscussion = async (req, res) => {
  try {
    const discussionId = req.params.discussionId; // Use the correct parameter name here
    const discussion = await Discussion.findById(discussionId);
    if (!discussion) {
      return res.status(404).json({ error: 'Discussion not found' });
    }
    discussion.likes += 1;
    await discussion.save();
    res.status(200).json({ discussion, message: 'Like count updated successfully' });
  } catch (error) {
    console.error('Error liking discussion:', error);
    res.status(500).json({ error: 'Failed to like discussion' });
  }
};
exports.unlikeDiscussion = async (req, res) => {
  try {
    const discussionId = req.params.discussionId; // Use the correct parameter name here
    const discussion = await Discussion.findById(discussionId);
    if (!discussion) {
      return res.status(404).json({ error: 'Discussion not found' });
    }
    discussion.likes -= 1;
    await discussion.save();
    res.status(200).json({ discussion, message: 'Like count updated successfully' });
  } catch (error) {
    console.error('Error liking discussion:', error);
    res.status(500).json({ error: 'Failed to like discussion' });
  }
};


exports.addDiscussion = async (req, res) => {
  try {
      const challengeId = req.params.challengeId;
      const newDiscussion = new Discussion({
          challengeId,
          sentBy:req.user.id,
          sendingDate:new Date(),
          content:req.body.content,
          
      });
          
      await newDiscussion.save();

      res.status(201).json({ success: true, message: 'Discussion added successfully' });
  } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to add Discussion', error: error.message });
  }

};
exports.getDiscussionByChallengeId = async (req, res) => {
  const { challengeId } = req.params;

  try {
    const discussions = await Discussion.find({ challengeId }).populate({
      path: 'answers',
      populate: { path: 'repliedBy' } // Populate the repliedBy field within answers
    }).populate('sentBy');

    if (!discussions || discussions.length === 0) {
      return res.status(404).json({ message: 'No discussions found for this challenge ID' });
    }

    res.status(200).json(discussions);
  } catch (error) {
    console.error('Error retrieving discussions:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.addReplyToDiscussion = async (req, res) => {
  try {
    const discussionId = req.params.discussionId;
    const { content } = req.body;

    const discussion = await Discussion.findById(discussionId);
    if (!discussion) {
      return res.status(404).json({ error: 'Discussion not found' });
    }

    const newReply = {
      content,
      repliedBy: req.user.id,
      replyDate: new Date()
    };

    discussion.answers.push(newReply);
    await discussion.save();

    res.status(201).json({ success: true, message: 'Reply added successfully' });
  } catch (error) {
    console.error('Error adding reply to discussion:', error);
    res.status(500).json({ success: false, message: 'Failed to add reply to discussion', error: error.message });
  }
};


exports.deleteDiscussion = async (req, res) => {
  try {
      const discussion = await Discussion.findByIdAndDelete(req.params.discussionId);
      if (!discussion) {
          return res.status(404).json({ message: "Discussion not found" });
      }
      return res.status(200).json({ message: "Discussion deleted successfully" });
  } catch (error) {
      console.error("Error deleting discussion:", error);
      return res.status(500).json({ message: "Internal server error" });
  }
};



exports.deleteReply = async (req, res) => {
  try {
      const { discussionId, replyId } = req.params;
      const discussion = await Discussion.findById(discussionId);

      // Check if the discussion exists
      if (!discussion) {
          return res.status(404).json({ message: "Discussion not found" });
      }

      // Find the index of the reply in the discussion's answers array
      const replyIndex = discussion.answers.findIndex(reply => reply._id.toString() === replyId);

      // Check if the reply exists
      if (replyIndex === -1) {
          return res.status(404).json({ message: "Reply not found" });
      }

      // Remove the reply from the answers array
      discussion.answers.splice(replyIndex, 1);
      await discussion.save();

      return res.status(200).json({ message: "Reply deleted successfully" });
  } catch (error) {
      console.error("Error deleting reply:", error);
      return res.status(500).json({ message: "Internal server error" });
  }
};
exports.getChallengesByTeam = async (req, res) => {
  try {
    // Get the team ID from the request parameters
    const teamId = req.params.teamId;

    // Find challenges where the team is a participant or has a participation request
    const participantChallenges = await Challenge.find({
      $or: [
        { 'participations.TeamParticipants': teamId },
        { 'participations.TeamParticipationRequests': teamId }
      ]
    });

    // Find submissions related to the team
    const submissions = await Submission.find({ submittedByTeam: teamId });

    // Extract unique challenge IDs from submissions
    const challengeIdsFromSubmissions = submissions.map(submission => submission.challengeId);
    const uniqueChallengeIdsFromSubmissions = [...new Set(challengeIdsFromSubmissions)];

    // Find challenges related to submissions
    const challengesFromSubmissions = await Challenge.find({ _id: { $in: uniqueChallengeIdsFromSubmissions } });

    // Concatenate both sets of challenges
    const allChallenges = [...participantChallenges, ...challengesFromSubmissions];

    // Return all challenges
    res.status(200).json({ challenges: allChallenges });
  } catch (error) {
    console.error('Error fetching challenges by team:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
