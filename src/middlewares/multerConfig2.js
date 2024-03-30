const multer = require('multer');

const MIME_TYPES = {
  'application/pdf': 'pdf', // MIME type for PDF
  'application/vnd.ms-excel': 'xls', // MIME type for Excel
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx', // MIME type for Excel 2007+
};

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, 'uploads'); // Adjust the destination directory as per your requirement
  },
  filename: (req, file, callback) => {
    const name = file.originalname.split(' ').join('_');
    const extension = MIME_TYPES[file.mimetype];
    callback(null, name + '_' + Date.now() + '.' + extension);
  }
});

module.exports = multer({ storage: storage }).single('file'); // Change 'image' to 'file' as it's a more generic name

