const User = require('../models/User');
const Challenge = require('../models/challenge');
const { getSocketInstance } = require('../../socket');
const Notification = require('../models/notifications');
const Discussion = require('../models/discussion');
const Team = require('../models/team');
const twilio = require('twilio');
const accountSid = 'AC2d8da5466e64b11d5eade89b932c7ead';
const authToken = '2e8688c72ad97dd52932ac0f0e9b8e1f';
const client = twilio(accountSid, authToken);
const rewardemail = require('../utils/rewardemail');

exports.RecommendChallengers = async (req, res) => {
  try {
    const challengeId = req.params.challengeId;
    
    // Retrieve the challenge details including its targeted skills
    const challenge = await Challenge.findById(challengeId);
    if (!challenge) {
      return res.status(404).json({ message: 'Aucun challenge trouvé' });
    }

    const targetedSkills = challenge.targetedSkills;

    // Find users who have at least 30% of the challenge skills and role == 'challenger'
    const usersWithMatchingSkills = await User.find({
      skills: { $in: targetedSkills }, // Users who have at least one matching skill
      role: 'challenger', // Only users with the role 'challenger'
    });

    // Filter users by matching percentage in JavaScript
    const recommendedUsers = usersWithMatchingSkills.filter(user => {
      const matchingSkills = user.skills.filter(skill => targetedSkills.includes(skill));
      return (matchingSkills.length / targetedSkills.length) >0;
    });

    // Sort recommendedUsers by matching percentage
    recommendedUsers.sort((a, b) => {
      const matchingSkillsA = a.skills.filter(skill => targetedSkills.includes(skill));
      const matchingSkillsB = b.skills.filter(skill => targetedSkills.includes(skill));
      return (matchingSkillsB.length / targetedSkills.length) - (matchingSkillsA.length / targetedSkills.length);
    });

    // Return the list of recommended users
    res.status(200).json({ recommendedUsers });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.sendRewardEmail = async (req, res) => {
  const { winnerEmail , winnerName , challengetitle,amount,prizes,recruitement,freelance,internship,companyname  } = req.body;

  // Log the extracted winner email
  console.log('Winner Email:', winnerEmail);

  // Send reward email to the winner
  try {
    const emailResponse = await rewardemail(
      winnerEmail,
      winnerName,
      challengetitle,
      amount,
      prizes,
      recruitement,
      freelance,
      internship,
      companyname,
      'Congratulations on Winning!',
      'rewardemail' // Assuming 'reward' is the name of your Handlebars template
    );
    
    // Check if email was sent successfully
    if (emailResponse.status === 'success') {
      console.log('Reward email sent successfully');
      res.status(200).send('Reward email sent successfully');
    } else {
      console.error('Error sending reward email:', emailResponse.error);
      res.status(500).send('Error sending reward email');
    }
  } catch (error) {
    console.error('Error sending reward email:', error);
    res.status(500).send('Error sending reward email');
  }
};



exports.acceptParticipationtitle = async (req, res) => {
  const { challengeTitle, userId } = req.params; // Change challengeId to challengeTitle
  const type = req.body.type;
  try {
    const io = getSocketInstance();
    const challenge = await Challenge.findOne({ title: challengeTitle }); // Find challenge by title instead of ID
    const userCompany = await User.findById();

    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    // Check if the user is in the participation requests
    if (type === "Request") {
      const index = challenge.participations.soloParticipationRequests.findIndex(request => request.toString() === userId);
      if (index === -1) {
        return res.status(404).json({ message: 'User not found in participation requests' });
      }
      // Move user from participation requests to participants
      const user = challenge.participations.soloParticipationRequests.splice(index, 1)[0];
      challenge.participations.soloParticipants.push(user);

      const notifications = await Notification.create({
        title: "Accept Participation Request",
        content: "has accept your participation request",
        recipientUserId: user,
        isAdminNotification: false
      });

      await challenge.save();

      return res.status(200).json({ message: 'Participation request accepted successfully' });
    } else if (type === "TeamRequest") {
      const index = challenge.participations.TeamParticipationRequests.findIndex(request => request.toString() === userId);
      if (index === -1) {
        return res.status(404).json({ message: 'Team not found in participation requests' });
      }
      // Move user from participation requests to participants
      const teamId = challenge.participations.TeamParticipationRequests.splice(index, 1)[0];
      const team = await Team.findById(userId);
      if (!team) {
        return res.status(404).json({ message: 'Team not found' });
      }
      challenge.participations.TeamParticipants.push(team);

      const notifications = await Notification.create({
        title: "Accept Participation Request",
        content: "has accept your participation request",
        recipientUserId: team.leader,
        UserConcernedId: challenge.createdBy,
        isAdminNotification: false
      });

      await challenge.save();

      return res.status(200).json({ message: 'Participation request accepted successfully' });
    } else {
      return res.status(400).json({ message: 'Invalid participation request type' });
    }
  } catch (error) {
    console.error('Error accepting participation request:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.declineParticipationtitle = async (req, res) => {
  const { challengeTitle, userId } = req.params;

  try {
    const challenge = await Challenge.findOne({ title: challengeTitle });

    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    // Check if the user is in the team participation requests
    const index = challenge.participations.TeamParticipationRequests.findIndex(request => request.toString() === userId);
    if (index === -1) {
      return res.status(404).json({ message: 'User not found in team participation requests' });
    }

    // Remove the user from team participation requests
    challenge.participations.TeamParticipationRequests.splice(index, 1)[0];

    await challenge.save();

    res.status(200).json({ message: 'Participation request declined successfully' });
  } catch (error) {
    console.error('Error declining participation request:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


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
   let targetedSkills = req.body.targetedSkills;
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
    req.body.targetedSkills=targetedSkills;
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
        ChallengeConcernedId:challengeId,
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

    await io.emit("newParticipationRequestTeam", { name:team.name , idUser:challenge.createdBy , content:"has sent a participation request"}); 
    const notifications = await Notification.create({
        title:"Participation Team Request",
        content:"has sent a participation request",
        recipientUserId:challenge.createdBy,
        TeamConcernedId:team._id,
        ChallengeConcernedId:challengeId,
        isAdminNotification:false
    })

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
        ChallengeConcernedId:challengeId,
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

    await io.emit("AcceptParticipationTeamRequest", { firstname:userCompany.FirstName , lastname:userCompany.LastName ,idUser:team.leader,content:`has accept your participation request for your team ${team.name}`}); 
    const notifications = await Notification.create({
        title:"Accept Participation Request",
        content:`has accept your participation request for your team ${team.name}`,
        recipientUserId:team.leader,
        UserConcernedId:challenge.createdBy,
        ChallengeConcernedId:challengeId,
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
exports.getChallengerSkills = async (req, res) => {
  const userId = req.params.userId;
  try {
    let userSkills = [];
    if (userId) {
      const user = await User.findById(userId);
      if (user) {
        userSkills = user.skills;
      }
    }

    const allChallenges = await Challenge.find();

    // Filtrer les challenges de type matching
    const matchingChallenges = allChallenges.filter(challenge => {
      const challengeSkills = challenge.targetedSkills || [];
      return challengeSkills.some(skill => userSkills.includes(skill));
    });

    // Filtrer les challenges qui ne sont pas de type matching
    const nonMatchingChallenges = allChallenges.filter(challenge => {
      const challengeSkills = challenge.targetedSkills || [];
      return !challengeSkills.some(skill => userSkills.includes(skill));
    });

    // Concaténer les challenges de type matching en premier
    const sortedChallenges = matchingChallenges.concat(nonMatchingChallenges);

    res.status(200).json(sortedChallenges);
  } catch (error) {
    console.error('Error fetching challenger skills:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};






exports.getFilteredParticipationsByType = async (req, res) => { // Correction ici
  const { challengeId, type } = req.params;
  try {
    let participations;
    const challenge = await Challenge.findById(challengeId);
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge non trouvé' });
    }
    
    // Filtrer les participations en fonction du type
    switch (type) {
      case 'soloParticipants':
        participations = challenge.soloParticipants;
        break;
      case 'teamParticipants':
        participations = challenge.teamParticipants;
        break;
      case 'soloParticipationRequests':
        participations = challenge.soloParticipationRequests;
        break;
      case 'teamParticipationRequests':
        participations = challenge.teamParticipationRequests;
        break;
      default:
        return res.status(400).json({ message: 'Type de participation invalide' });
    }
    
    res.json(participations);
  } catch (error) {
    console.error('Erreur lors de la récupération des participations filtrées par type :', error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération des participations filtrées par type' });
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
