const express = require('express');
const router = express.Router();
const Opportunity = require('../models/Opportunity');
const auth = require('../middleware/auth');

// Helper: determine section from status
function sectionFromStatus(status) {
  const s = (status || '').toLowerCase().trim();
  const appliedStatuses = ['applied', 'applied thru referral', 'given oa'];
  const completedStatuses = ['selected 🔥', 'rejected', 'done'];
  if (appliedStatuses.includes(s)) return 'applied';
  if (completedStatuses.includes(s)) return 'completed';
  return 'yet_to_apply';
}

// POST /api/opportunities — create a new tracked opportunity
router.post('/', auth, async (req, res) => {
  try {
    const data = req.body;
    data.userId = req.user.id; // Assign to logged-in user
    
    // Auto-assign section from status if not provided
    if (!data.section) {
      data.section = sectionFromStatus(data.status);
    }
    const opportunity = new Opportunity(data);
    await opportunity.save();
    return res.status(201).json({ success: true, data: opportunity });
  } catch (error) {
    console.error('Create error:', error);
    return res.status(500).json({ error: 'Failed to save opportunity' });
  }
});

// GET /api/opportunities — list opportunities with optional filters
router.get('/', auth, async (req, res) => {
  try {
    const { type, section } = req.query;

    const filter = { userId: req.user.id };
    if (type) filter.type = type;
    if (section) filter.section = section;

    const opportunities = await Opportunity.find(filter)
      .sort({ deadline: 1, createdAt: -1 })
      .lean();

    return res.json({ success: true, data: opportunities });
  } catch (error) {
    console.error('List error:', error);
    return res.status(500).json({ error: 'Failed to fetch opportunities' });
  }
});

// GET /api/opportunities/stats — counts per section per type
router.get('/stats', auth, async (req, res) => {
  try {
    const pipeline = [
      { $match: { userId: req.user.id } },
      {
        $group: {
          _id: { type: '$type', section: '$section' },
          count: { $sum: 1 }
        }
      }
    ];
    const results = await Opportunity.aggregate(pipeline);

    // Build a structured response
    const stats = {
      competition: { yet_to_apply: 0, applied: 0, completed: 0, total: 0 },
      internship: { yet_to_apply: 0, applied: 0, completed: 0, total: 0 },
      oncampus: { yet_to_apply: 0, applied: 0, completed: 0, total: 0 }
    };

    results.forEach(r => {
      const t = r._id.type || 'competition';
      const s = r._id.section || 'yet_to_apply';
      if (stats[t]) {
        stats[t][s] = (stats[t][s] || 0) + r.count;
        stats[t].total += r.count;
      }
    });

    return res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Stats error:', error);
    return res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// GET /api/opportunities/:id — single opportunity
router.get('/:id', auth, async (req, res) => {
  try {
    const opportunity = await Opportunity.findOne({ _id: req.params.id, userId: req.user.id }).lean();
    if (!opportunity) return res.status(404).json({ error: 'Not found' });
    return res.json({ success: true, data: opportunity });
  } catch (error) {
    console.error('Get error:', error);
    return res.status(500).json({ error: 'Failed to fetch opportunity' });
  }
});

// PUT /api/opportunities/:id — update opportunity
router.put('/:id', auth, async (req, res) => {
  try {
    const updates = req.body;
    // Auto-update section if status changed
    if (updates.status && !updates.section) {
      updates.section = sectionFromStatus(updates.status);
    }
    const opportunity = await Opportunity.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      updates,
      { new: true, runValidators: true }
    );
    if (!opportunity) return res.status(404).json({ error: 'Not found' });
    return res.json({ success: true, data: opportunity });
  } catch (error) {
    console.error('Update error:', error);
    return res.status(500).json({ error: 'Failed to update opportunity' });
  }
});

// PATCH /api/opportunities/:id/move — drag-and-drop section change
router.patch('/:id/move', auth, async (req, res) => {
  try {
    const { section } = req.body;
    if (!['yet_to_apply', 'applied', 'completed'].includes(section)) {
      return res.status(400).json({ error: 'Invalid section' });
    }
    const opportunity = await Opportunity.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { section },
      { new: true }
    );
    if (!opportunity) return res.status(404).json({ error: 'Not found' });
    return res.json({ success: true, data: opportunity });
  } catch (error) {
    console.error('Move error:', error);
    return res.status(500).json({ error: 'Failed to move opportunity' });
  }
});

// DELETE /api/opportunities/:id — delete opportunity
router.delete('/:id', auth, async (req, res) => {
  try {
    const opportunity = await Opportunity.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!opportunity) return res.status(404).json({ error: 'Not found' });
    return res.json({ success: true, message: 'Deleted' });
  } catch (error) {
    console.error('Delete error:', error);
    return res.status(500).json({ error: 'Failed to delete opportunity' });
  }
});

module.exports = router;
