const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  fileName: { type: String, required: true },
  fileData: { type: Buffer, required: true },
  contentType: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

module.exports = mongoose.model('Resume', resumeSchema);
