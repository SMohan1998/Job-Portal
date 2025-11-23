const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { authenticate, authorize } = require('../middleware/auth');
const profileController = require('../controllers/profilecontroller');

const fs = require('fs');


// storage - reuse uploads/profiles
const PROFILE_DIR = path.join(process.cwd(), 'uploads','profiles');

if (!fs.existsSync(PROFILE_DIR)) {
  fs.mkdirSync(PROFILE_DIR, { recursive: true });
}
const storage = multer.diskStorage({
  destination(req, file, cb) { cb(null, PROFILE_DIR); },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `profile-${req.user.id}-${Date.now()}${ext}`);
  }
});
const upload = multer({ storage });

// endpoints
router.get('/', authenticate, profileController.getProfile);
router.put('/', authenticate, profileController.updateProfile);
router.post('/profile-picture', authenticate, upload.single('profilePicture'), profileController.uploadProfilePicture);
router.post('/resume', authenticate, upload.single('resume'), profileController.uploadResume);
router.delete('/resume', authenticate, profileController.deleteResume);
router.get("/employer", authenticate, authorize("employer"), profileController.getEmployerProfile);


module.exports = router;
