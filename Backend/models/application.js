const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({

  job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
  jobSeeker: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['applied', 'interviewed', 'rejected'], default: 'applied' },
  resume: String,
  coverLetter: String,
}, { timestamps: true });

module.exports = mongoose.model('Application', applicationSchema);