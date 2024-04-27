const multer = require('multer');

const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'application/vnd.ms-excel': 'xls', // MIME type for Excel
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx', // MIME type for Excel 2007+
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
    const name = file.originalname.split(' ').join('_');
    const extension = MIME_TYPES[file.mimetype];
    callback(null, name + Date.now() + '.' + extension);
  }
});

const upload = multer({ storage: storage }).fields([{ name: 'image', maxCount: 1 }, { name: 'file', maxCount: 1 }]);

module.exports = upload;
