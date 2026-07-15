const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  fullName: { type: String, default: '' },
  email: { type: String, default: '' },
  education: {
    degree: { type: String, default: '' },
    branch: { type: String, default: '' },
    college: { type: String, default: '' },
    graduationYear: { type: String, default: '' },
    country: { type: String, default: '' },
    cgpa: { type: String, default: '' }
  },
  skills: [String],
  projects: [{
    title: { type: String, default: '' },
    description: { type: String, default: '' },
    techStack: [String]
  }],
  achievements: [String],
  experience: [{
    role: { type: String, default: '' },
    company: { type: String, default: '' },
    duration: { type: String, default: '' },
    description: { type: String, default: '' }
  }],
  interests: [String],
  careerGoals: { type: String, default: '' }
}, {
  timestamps: true
});

module.exports = mongoose.model('Profile', profileSchema);
