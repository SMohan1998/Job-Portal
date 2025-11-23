const express = require('express');
const router = express.Router();
const Application = require('../models/application');
const User = require('../models/user');
const Job = require('../models/job');
const { authenticate, authorize } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

//ensure uploads/ directory exists
const APP_UPLOAD_DIR = path.join(process.cwd(), 'uploads','applications');
const PROFILE_UPLOAD_DIR = path.join(process.cwd(), 'uploads','profiles');
if (!fs.existsSync(APP_UPLOAD_DIR)) fs.mkdirSync(APP_UPLOAD_DIR, { recursive: true });
if (!fs.existsSync(PROFILE_UPLOAD_DIR)) fs.mkdirSync(PROFILE_UPLOAD_DIR, { recursive: true });

// Multer storage for application-level resume uploads (same uploads/ folder)
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, APP_UPLOAD_DIR);
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `application-${req.user.id}-${Date.now()}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = ['.pdf', '.doc', '.docx'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) cb(null, true);
  else cb(new Error('Only PDF, DOC, DOCX files are allowed'));
};

const upload = multer({ storage, fileFilter });

// Apply for a job (jobseeker only). Accepts optional resume file (field name 'resume')
// If applicant doesn't upload a resume here, backend will default to user's profile resume (if exists).
router.post('/', authenticate, authorize('jobseeker'), upload.single('resume'), async (req, res) => {
  try {
    const { jobId, coverLetter } = req.body;
    // basic validation
    if (!jobId) return res.status(400).json({ msg: 'jobId is required' });
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ msg: 'Job not found' });
    // check already applied
    const existingApplication = await Application.findOne({ job: jobId, jobSeeker: req.user.id }).sort({ createdAt: -1 });
    if (existingApplication && existingApplication.status !== 'rejected')
      {
        return res.status(400).json({ msg: 'Already applied' });
      }

    // pick resume: uploaded file or user's profile resume
    let resumePath = null;
    if (req.file && req.file.path) {
      resumePath = path.relative(process.cwd(), req.file.path).split(path.sep).join('/'); // normalize to forward slashes
    } else {
      const user = await User.findById(req.user.id);
      if (user && user.resume) resumePath = user.resume;
    }

    const application = new Application({
      job: jobId,
      jobSeeker: req.user.id,
      resume: resumePath,
      coverLetter,
    });

    await application.save();
    res.status(201).json(application);
  } catch(err) {
    console.error('Apply error:', err);
    res.status(500).json({ msg: err.message || 'Application failed' });
  }
});

// Get applications for employer (own job posts)
router.get('/employer', authenticate, authorize('employer'), async (req, res) => {
  try {
    const applications = await Application.find()
      .populate('job')
      .populate('jobSeeker', 'username email skills experience');

    const filtered = applications.filter(a => a.job && a.job.employer && a.job.employer.toString() === req.user.id);
    res.json(filtered);
  } catch(err) {
    console.error('Get employer applications error:', err);
    res.status(500).json({ msg: err.message || 'Failed to fetch applications'});
  }
});

// Download applicant resume (employer only) - GET /api/applications/:id/resume
router.get('/:id/resume', authenticate, authorize('employer'), async (req, res) => {
  try {
    const app = await Application.findById(req.params.id).populate('job jobSeeker');
    if (!app) return res.status(404).json({ msg: 'Application not found' });

    // verify employer owns the job
    if (!app.job || app.job.employer.toString() !== req.user.id) return res.status(403).json({ msg: 'Unauthorized' });

    if (!app.resume) return res.status(404).json({ msg: 'No resume attached' });

    // resolve path relative to project root
    const fullPath = path.isAbsolute(app.resume) ? app.resume : path.join(process.cwd(), app.resume);
    if (!fs.existsSync(fullPath)) return res.status(404).json({ msg: 'Resume file not found on disk' });

    return res.download(fullPath, path.basename(fullPath));
  } catch (err) {
    console.error('Download resume error:', err);
    res.status(500).json({ msg: err.message || 'Failed to download resume' });
  }
});

// Update application status (employer only)
router.put('/:id/status', authenticate, authorize('employer'), async (req, res) => {
  try {
    const application = await Application.findById(req.params.id).populate('job');
    if (!application) return res.status(404).json({ msg: 'Application not found' });
    if (!application.job || application.job.employer.toString() !== req.user.id) return res.status(403).json({ msg: 'Unauthorized' });

    const {status} = req.body;
    const allowedStatuses = ['applied', 'interviewed', 'reviewed', 'rejected', 'hired'];
    if (!allowedStatuses.includes(status)) return res.status(400).json({ msg: 'Invalid status' });

    application.status = status;
    await application.save();
    res.json(application);
  } catch(err) {
    console.error('Update application status error:', err);
    res.status(500).json({ msg: err.message || 'Failed to update application status'});
  }
});

// Get applications for job seeker
router.get('/jobseeker', authenticate, authorize('jobseeker'), async (req, res) => {
  try {
    const applications = await Application.find({ jobSeeker: req.user.id })
      .populate('job')
      .populate('jobSeeker', 'username email skills experience');
    res.json(applications);
  } catch(err) {
    console.error('Get jobseeker applications error:', err);
    res.status(500).json({ msg: err.message || 'Failed to fetch applications' });
  }
});

module.exports = router;