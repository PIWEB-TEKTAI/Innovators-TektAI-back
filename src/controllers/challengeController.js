const User = require('../models/User');
const Challenge = require('../models/challenge');
const { getSocketInstance } = require('../../socket');
const Notification = require('../models/notifications');


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
        req.body.dataset.fileUrl = fileUrl;
        req.body.image = imageUrl;
      });
    }else {
      req.body.dataset.fileUrl = challenge.dataset.fileUrl;
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
      const challenge = await Challenge.findById(challengeId);
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
    req.body.dataset.fileUrl = fileUrl;
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
      const challenge = await Challenge.findById(challengeId).populate('createdBy'); 


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
      // Fetch all challenges from the database
      const challenges = await Challenge.find();

      // Calculate statistics
      const totalChallenges = challenges.length;
      const openChallenges = challenges.filter(challenge => challenge.status === 'open').length;
      const completedChallenges = challenges.filter(challenge => challenge.status === 'completed').length;
      const archivedChallenges = challenges.filter(challenge => challenge.status === 'archived').length;

      // Return the statistics along with the challenges
      return res.status(200).json({
          challenges,
          statistics: {
              totalChallenges,
              openChallenges,
              completedChallenges,
              archivedChallenges
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

    const userChallenger = await User.findById(userId);
    challenge.participations.soloParticipationRequests.push( userId );
    await challenge.save();
    await io.emit("newParticipationRequest", { firstname:userChallenger.FirstName , lastname:userChallenger.LastName ,idCompany:challenge.createdBy,content:"has sent a participation request"}); 
    const notifications = await Notification.create({
        title:"Participation Request",
        content:"has sent a participation request",
        recipientUserId:challenge.createdBy,
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

    // Move user from participation requests to participants
    const user = challenge.participations.soloParticipationRequests.splice(index, 1)[0];
    challenge.participations.soloParticipants.push(user);

    await challenge.save();

    res.status(200).json({ message: 'Participation request accepted successfully' });
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