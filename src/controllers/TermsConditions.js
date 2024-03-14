const TermsConditions = require("../models/TermsConditions");





const SaveTermsConditions = async (req,res) =>{

    const {
    title, 
    content} = req.body

    try {
        const termsConditions = new TermsConditions({
            title:title,
            content:content
        });
        await termsConditions.save();
        res.status(201).json({ msg: "Information submitted successfully" });
      } catch (error) {
        console.error('Error saving terms and conditions:', error);
        res.status(500).json({ msg: "An error occurred while saving information" });
      }
}


const UpdateTermsConditions = async (req,res) =>{

  const updatedData = req.body

  const id = req.params.id

  try {
      const termsConditions = await TermsConditions.findByIdAndUpdate(id , updatedData , { new:true })
      if (!termsConditions) {
        return res.status(404).json({ message: 'Terms conditions not found' , updatedData: termsConditions});
      }
      res.status(201).json({ msg: "Information updated successfully" });
    } catch (error) {
      console.error('Error updating terms and conditions:', error);
      res.status(500).json({ msg: "An error occurred while saving information" });
    }
}



const GetTermsConditions = async (req,res) =>{

  try {
    const termsConditions = await TermsConditions.find().exec();
    
    return res.status(200).json({ termsConditions });

  } catch (error) {
    console.error('Error finding data', error);
    return res.status(500).send({ message: 'Internal Server Error' });
  }

}




const DeleteTermsConditions = async (req,res) =>{

  const id = req.params.id

  try {
  
      const termsConditions = await TermsConditions.deleteOne({_id:id});

      if (!termsConditions) {
        return res.status(404).json({ message: 'Terms conditions not found'});
      }
      res.status(201).json({ msg: "Information deleted successfully" });
    } catch (error) {
      console.error('Error deleting terms and conditions:', error);
      res.status(500).json({ msg: "An error occurred while deleting information" });
    }
}



module.exports = {
    SaveTermsConditions,
    GetTermsConditions,
    UpdateTermsConditions,
    DeleteTermsConditions
}
 
 
 