const Challenge = require('../models/challenge');

exports.editChallenge = async (req, res) => {
    try {

    const challenge = await Challenge.findById({_id:req.params.id});

    if(req.file){
        const fileUrl = req.file
        ? {
         fileUrl: `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`,
       }
       :null;  
        console.log(fileUrl)  
        req.body.dataset.fileUrl = fileUrl.fileUrl;
     }  else {
        req.body.dataset.fileUrl = challenge.dataset.fileUrl
     }
     
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
  
