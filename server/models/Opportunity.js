const mongoose = require('mongoose');

const opportunitySchema = new mongoose.Schema({
  userId: { type: String, required: true },
  sourceUrl: { type: String, default: '' },
  title: { type: String, required: true, default: 'Untitled' },
  description: { type: String, default: '' },
  type: {
    type: String,
    enum: ['internship', 'competition', 'oncampus'],
    default: 'competition'
  },
  status: {
    type: String,
    default: 'yet to apply'
  },
  section: {
    type: String,
    enum: ['yet_to_apply', 'applied', 'completed'],
    default: 'yet_to_apply'
  },
  deadline: { type: Date, default: null },
  resumeUsed: { type: String, default: 'Default' },
  referralName: { type: String, default: '' }
}, {
  timestamps: true
});

// Index for efficient querying by type and section
opportunitySchema.index({ type: 1, section: 1 });
opportunitySchema.index({ deadline: 1 });

module.exports = mongoose.model('Opportunity', opportunitySchema);
