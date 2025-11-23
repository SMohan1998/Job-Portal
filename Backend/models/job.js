const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  employer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: String,
  description: String,
  requirements: String,
  location: String,
  salary: String,
}, { timestamps: true });

module.exports = mongoose.model('Job', jobSchema);