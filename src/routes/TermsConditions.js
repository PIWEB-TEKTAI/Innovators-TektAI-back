const express = require("express")
const terms = require('../controllers/TermsConditions')
const router = express.Router();


router.post('/save', terms.SaveTermsConditions);
router.get('/list', terms.GetTermsConditions);
router.put('/update/:id', terms.UpdateTermsConditions);
router.delete('/delete/:id', terms.DeleteTermsConditions);


module.exports = router