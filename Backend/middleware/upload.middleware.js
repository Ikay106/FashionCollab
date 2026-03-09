const multer = require('multer');
const path = require('path');

// Store files in memory (RAM) temporarily — then we send them to Supabase
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max size
  fileFilter: (req, file, cb) => {
    // Only allow images
    const allowedTypes = /jpeg|jpg|png|gif/;
    const ext = path.extname(file.originalname).toLowerCase();
    const mime = file.mimetype.toLowerCase();

    if (allowedTypes.test(ext) && allowedTypes.test(mime)) {
      cb(null, true); // accept file
    } else {
      cb(new Error('Only images allowed (jpg, jpeg, png, gif)'));
    }
  }
});

// We use .single('image') → the frontend must send a field named "image"
module.exports = {
  uploadImage: upload.single('image')
};