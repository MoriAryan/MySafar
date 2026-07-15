const express = require('express');
const router = express.Router();
const Profile = require('../models/Profile');
const auth = require('../middleware/auth');

// GET /api/profile
router.get('/', auth, async (req, res) => {
  try {
    let profile = await Profile.findOne({ userId: req.user.id }).lean();
    if (!profile) {
      // Create empty profile if none exists for this user
      profile = await Profile.create({ userId: req.user.id, fullName: req.user.name, email: req.user.email });
      profile = profile.toObject();
    }
    return res.json({ success: true, data: profile });
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// PUT /api/profile
router.put('/', auth, async (req, res) => {
  try {
    const data = req.body;
    // Don't let them overwrite their userId
    delete data.userId;

    const profile = await Profile.findOneAndUpdate(
      { userId: req.user.id },
      data,
      { new: true, upsert: true, runValidators: true }
    );
    return res.json({ success: true, data: profile });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({ error: 'Failed to update profile' });
  }
});

module.exports = router;
