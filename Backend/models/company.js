const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // employer user id
  name: { type: String, required: true },
  description: String,
  logo: String,
  location: String,
  website: String,
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Company', companySchema);
