const Challenge = require('../models/challenge');

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



exports.getChallenge = async (req, res) => {
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
      // Find the challenge by ID in the database
      const challenge = await Challenge.findById(challengeId);

      // Check if the challenge exists
      if (!challenge) {
          return res.status(404).json({ message: 'Challenge not found' });
      }

      // Return the challenge details
      return res.status(200).json(challenge);
  } catch (error) {
      // Handle any errors
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