const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['jobseeker', 'employer'], required: true },
  // jobseeker profile
  experience: String,
  education: String,
  skills: [String],
  contactDetails: String,
  profilePicture: String,
  resume: String,
  // link to a Company doc (if employer)
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  // companyName kept for quick display
  companyName: String,
  companyDescription: String,
  companyLogo: String,
  companyLocation: String,
  phone: String,
  about: String,

  // password reset token (stored hashed for security)
  passwordResetToken: String,
  passwordResetExpires: Date,
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
