const Challenge = require('../models/challenge');

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
