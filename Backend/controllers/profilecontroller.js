// controllers/profilecontroller.js
const path = require('path');
const fs = require('fs');
const User = require('../models/user');

const PROFILE_DIR = path.join(process.cwd(), 'uploads','profiles');
if (!fs.existsSync(PROFILE_DIR)) fs.mkdirSync(PROFILE_DIR, { recursive: true });

module.exports = {
  // get current authenticated user profile
  async getProfile(req, res) {
    try {
      const user = await User.findById(req.user.id)
        .select('-password')
        .populate('company', 'name logo location website');
      if (!user) return res.status(404).json({ msg: 'User not found' });
      res.json(user);
    } catch (err) {
      console.error('Get profile error:', err);
      res.status(500).json({ msg: err.message || 'Failed to fetch profile' });
    }
  },

  // update profile fields (jobseeker or employer)
  async updateProfile(req, res) {
    try {
      const allowed = ['username','experience','education','skills','contactDetails','phone', 'about'];
      const input = {};
      for (const k of allowed) if (k in req.body) input[k] = req.body[k];

      // If skills is comma-separated string, convert to array
      if (typeof input.skills === 'string') {
        input.skills = input.skills.split(',').map(s => s.trim()).filter(Boolean);
      }

      const updated = await User.findByIdAndUpdate(req.user.id, input, { new: true, runValidators: true }).select('-password');
      res.json(updated);
    } catch (err) {
      console.error('Update profile error:', err);
      res.status(500).json({ msg: err.message || 'Failed to update profile' });
    }
  },

  // upload profile picture
  async uploadProfilePicture(req, res) {
    try {
      if (!req.file) return res.status(400).json({ msg: 'No file uploaded' });
      const user = await User.findById(req.user.id);
      if (!user) return res.status(404).json({ msg: 'User not found' });

      // delete old file if exists
      if (user.profilePicture) {
        const prev = path.isAbsolute(user.profilePicture) ? user.profilePicture : path.join(process.cwd(), user.profilePicture);
        if (fs.existsSync(prev)) try { fs.unlinkSync(prev); } catch(e){ console.warn(e); }
      }

      const relative = path.relative(process.cwd(), req.file.path).split(path.sep).join('/');
      user.profilePicture = relative;
      await user.save();
      res.json({ msg: 'Profile picture uploaded', path: relative });
    } catch (err) {
      console.error('Upload profile picture error:', err);
      res.status(500).json({ msg: err.message || 'Profile picture upload failed' });
    }
  },

  // upload resume (replaces existing resume)
  async uploadResume(req, res) {
    try {
      if (!req.file) return res.status(400).json({ msg: 'No file uploaded' });
      const user = await User.findById(req.user.id);
      if (!user) return res.status(404).json({ msg: 'User not found' });

      if (user.resume) {
        const prev = path.isAbsolute(user.resume) ? user.resume : path.join(process.cwd(), user.resume);
        if (fs.existsSync(prev)) try { fs.unlinkSync(prev); } catch(e){ console.warn(e); }
      }

      const relative = path.relative(process.cwd(), req.file.path).split(path.sep).join('/');
      user.resume = relative;
      await user.save();
      res.json({ msg: 'Resume uploaded', path: relative });
    } catch (err) {
      console.error('Upload resume error:', err);
      res.status(500).json({ msg: err.message || 'Resume upload failed' });
    }
  },

  // delete resume
  async deleteResume(req, res) {
    try {
      const user = await User.findById(req.user.id);
      if (!user || !user.resume) return res.status(400).json({ msg: 'No resume to delete' });

      const full = path.isAbsolute(user.resume) ? user.resume : path.join(process.cwd(), user.resume);
      if (fs.existsSync(full)) try { fs.unlinkSync(full); } catch(e){ console.warn(e); }
      user.resume = undefined;
      await user.save();
      res.json({ msg: 'Resume deleted' });
    } catch (err) {
      console.error('Delete resume error:', err);
      res.status(500).json({ msg: err.message || 'Resume deletion failed' });
    }
  },

  async getEmployerProfile (req, res) {
  try {
    const employer = await User.findById(req.user.id).select("-password");
    res.json(employer);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
},

};
