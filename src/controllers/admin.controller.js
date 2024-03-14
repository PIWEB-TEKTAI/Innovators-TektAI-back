const config = require("../configs/auth.config");
const User = require("../models/User");
const AboutUs = require('../models/aboutUs');
const WhyUs = require('../models/WhyUs');

exports.getUsersWithAccountSwitchRequest = async (req,res)=>{
    try {
      const users = await User.find({ isDemandingToSwitchAccount: true });
      return res.status(200).send(users);
    } catch (error) {
      console.error('Error retrieving users:', error);
      throw error; // You can handle the error according to your application's needs
    }
}
exports.acceptSwitchRequest = async (req, res) => {
    const userId = req.params.id;
    console.log(userId);
    try {
      const user = await User.findById(userId);
  
      if (!user) {
        // Handle case where user is not found
        console.error('User not found');
        return null; // or throw an error, depending on your use case
      }
  
      // Update the user's role
      user.role = "company";
      user.isDemandingToSwitchAccount=false;
      user.state ="validated";
      user.AlreadyCompany = true;
  
      // Save the updated user
      const updatedUser = await user.save();
  
      return res.status(200).send(updatedUser);
    } catch (error) {
      // Handle error, e.g., log it or return an error response
      console.error('Error updating user role:', error);
      throw error;
    }
  };

  exports.getaboutus = async (req, res) => {
    try {
      const aboutUs = await AboutUs.findOne();
      if (!aboutUs) {
        console.log('No About Us content found in the database.');
        return res.status(404).json({ message: 'About Us content not found' });
      }
      res.json(aboutUs);
    } catch (err) {
      console.error('Error fetching About Us content:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
    
  // Update About Us content
  exports.updateaboutus = async (req, res) => {
    try {
      const aboutUs = await AboutUs.findOne();
      aboutUs.content = req.body.content;
      await aboutUs.save();
      res.json(aboutUs);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  };
  exports.initializeAboutUs = async (req, res) => {
    try {
      const aboutUs = await AboutUs.findOne();
      if (!aboutUs) {
        await AboutUs.create({ 
          content: `TektAI is a pioneering platform at the forefront of revolutionizing collaboration between industry challenges and data science developers. With a dynamic space for hosting competitions, fostering team collaboration, and recognizing outstanding contributions, TektAI is the nexus where innovation meets real-world problem-solving. Join us in creating a vibrant community where skills are honed, solutions are crafted, and the boundaries of what's possible in data science are continually pushed`
        });
        console.log('Default About Us content initialized.');
      }
    } catch (err) {
      console.error('Error initializing default About Us content:', err);
    }
  }
  
  exports.getwhyus = async (req, res) => {
    try {
      const whyUs = await WhyUs.find();
      if (!whyUs || whyUs.length === 0) {
        console.log('No Why Choose Us content found in the database.');
        return res.status(404).json({ message: 'WhyUs content not found' });
      }
      res.json(whyUs);
    } catch (err) {
      console.error('Error fetching WhyUs content:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
    // Update About Us content
    exports.updatewhyus = async (req, res) => {
      try {
        const { id, title, contentwhy } = req.body; // Assuming you send the ID along with the updated content
        const whyUs = await WhyUs.findById(id);
        if (!whyUs) {
          return res.status(404).json({ message: 'WhyUs content not found' });
        }
        whyUs.title = title;
        whyUs.contentwhy = contentwhy;
        await whyUs.save();
        res.json(whyUs);
      } catch (err) {
        res.status(400).json({ message: err.message });
      }
    };
      exports.initializewhyUs = async (req, res) => {
    try {
      const whyUs = await WhyUs.find();
      if (whyUs.length === 0) {
        await WhyUs.create([
          { 
            title: `Industry-Leading Expertise`,
            contentwhy: `With years of experience in the data science industry, we understand the unique challenges and opportunities that businesses and data science professionals face. Our team of experts brings unparalleled knowledge and insights to every project and challenge.`,
          },
          { 
            title: `Comprehensive Solutions`,
            contentwhy: `TektAI offers a comprehensive suite of solutions designed to meet the diverse needs of companies and data science professionals. From data science challenges to collaborative projects and access to a global talent pool, we provide everything you need to succeed in today's data-driven world.`,
          },
          { 
            title: `Collaborative Environment`,
            contentwhy: `We believe in the power of collaboration to drive innovation. Our platform provides a collaborative environment where companies and data science professionals can come together to solve real-world challenges, share knowledge, and push the boundaries of what's possible.`,
          },
          { 
            title: `Global Reach`,
            contentwhy: `With a global community of data science professionals and companies, TektAI offers unparalleled access to talent and opportunities from around the world. No matter where you are, you can connect with top talent and exciting projects right at your fingertips.`,
          }
        ]);
        console.log('Default WhyUs content initialized.');
      }
    } catch (err) {
      console.error('Error initializing default WhyUs content:', err);
    }
  }

  exports.addWhyUsItem = async (req, res) => {
    try {
      const { title, contentwhy } = req.body;
      const newItem = new WhyUs({ title, contentwhy });
      await newItem.save();
      res.status(201).json(newItem);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  };
  
  // Delete item from Why Us section
  exports.deleteWhyUsItem = async (req, res) => {
    try {
      const itemId = req.params.id;
      const deletedItem = await WhyUs.findByIdAndDelete(itemId);
      if (!deletedItem) {
        return res.status(404).json({ message: 'Item not found' });
      }
      res.json({ message: 'Item deleted successfully' });
    } catch (err) {
      res.status(500).json({ message: 'Internal server error' });
    }
  };
  