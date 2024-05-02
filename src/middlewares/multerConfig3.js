const multer = require('multer');
const crypto = require('crypto');

const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'video/mp4': 'mp4', // MIME type for MP4
  'application/pdf': 'pdf', // MIME type for PDF
  'application/vnd.ms-excel': 'xls', // MIME type for Excel
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx', // MIME type for Excel 2007+
  'application/msword': 'doc', // MIME type for Word
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx', // MIME type for Word 2007+
  'application/vnd.ms-powerpoint': 'ppt', // MIME type for PowerPoint
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx', // MIME type for PowerPoint 2007+
  'application/zip': 'zip', // MIME type for ZIP
  'application/x-zip-compressed': 'zip', // MIME type for ZIP

};

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    if (file.mimetype.startsWith('image/')) {
      callback(null, 'images');
    } else {
      callback(null, 'uploads');
    }
  },
  filename: (req, file, callback) => {
    const uniqueSuffix = Date.now() + '-' + crypto.randomBytes(8).toString('hex');
    console.log(file)
    const extension = MIME_TYPES[file.mimetype];
    callback(null, uniqueSuffix + '.' + extension);
  }
});

const upload = multer({ storage: storage }).any();

module.exports = upload;
