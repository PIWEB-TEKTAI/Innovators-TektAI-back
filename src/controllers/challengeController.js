const Challenge = require('../models/challenge');

exports.addChallenge = async (req, res) => {
  try {
    const fileUrl = req.file
    ? {
        fileUrl: `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`,
      }
    :null;  
    console.log(fileUrl)  
    req.body.dataset.fileUrl = fileUrl.fileUrl;
    const challengeData = {
      ...req.body,
      createdBy: req.user.id // Assuming req.user.id contains the ID of the logged-in user
    };

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
