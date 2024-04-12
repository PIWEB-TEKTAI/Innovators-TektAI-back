const Challenge = require('../models/challenge');
const Discussion = require('../models/discussion');


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
      const challenges = await Challenge.find();

      const totalChallenges = challenges.length;
      const openChallenges = challenges.filter(challenge => challenge.status === 'open').length;
      const completedChallenges = challenges.filter(challenge => challenge.status === 'completed').length;
      const archivedChallenges = challenges.filter(challenge => challenge.status === 'archived').length;

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
