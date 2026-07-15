const express = require('express');
const router = express.Router();
const multer = require('multer');
const Resume = require('../models/Resume');
const auth = require('../middleware/auth');

// Set up memory storage for Vercel compatibility
const storage = multer.memoryStorage();

// File filter (PDF only)
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// POST /api/resumes — upload a new resume PDF
router.post('/', auth, upload.single('resume'), async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Resume name is required' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Please upload a PDF file' });
    }

    const resume = new Resume({
      userId: req.user.id,
      name: name.trim(),
      fileName: req.file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_'),
      fileData: req.file.buffer,
      contentType: req.file.mimetype
    });

    await resume.save();

    // Return the saved object without the huge Buffer
    const savedResume = resume.toObject();
    delete savedResume.fileData;

    return res.status(201).json({ success: true, data: savedResume });
  } catch (error) {
    console.error('Upload resume error:', error);
    return res.status(500).json({ error: error.message || 'Failed to upload resume' });
  }
});

// GET /api/resumes — list all resumes (metadata only)
router.get('/', auth, async (req, res) => {
  try {
    // Exclude fileData to keep the list lightweight
    const resumes = await Resume.find({ userId: req.user.id }).select('-fileData').sort('-createdAt').lean();
    return res.json({ success: true, data: resumes });
  } catch (error) {
    console.error('List resumes error:', error);
    return res.status(500).json({ error: 'Failed to fetch resumes' });
  }
});

// GET /api/resumes/:id/view — serve the PDF file directly (no auth here so href links work easily, but it's unguessable ID)
router.get('/:id/view', async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);
    if (!resume || !resume.fileData) {
      return res.status(404).send('Resume file not found');
    }

    res.set('Content-Type', resume.contentType);
    res.set('Content-Disposition', `inline; filename="${resume.fileName}"`);
    return res.send(resume.fileData);
  } catch (error) {
    console.error('Serve resume error:', error);
    return res.status(500).send('Error loading resume file');
  }
});

// DELETE /api/resumes/:id — delete a resume
router.delete('/:id', auth, async (req, res) => {
  try {
    const resume = await Resume.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    return res.json({ success: true, message: 'Resume deleted successfully' });
  } catch (error) {
    console.error('Delete resume error:', error);
    return res.status(500).json({ error: 'Failed to delete resume' });
  }
});

module.exports = router;
