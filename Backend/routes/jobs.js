const express = require('express');
const router = express.Router();
const Job = require('../models/job');
const Application = require('../models/application');
const { authenticate, authorize } = require('../middleware/auth');
const fs = require('fs');
const path = require('path');

// Create job (employer only)
router.post('/', authenticate, authorize('employer'), async (req, res) => {
  const jobData = { ...req.body, employer: req.user.id };
  try {
    const job = new Job(jobData);
    await job.save();
    res.status(201).json(job);
  } catch(err) {
    console.error('Create job error:', err);
    res.status(500).json({ msg: err.message || 'Failed to create job' });
  }
});

// Get all jobs for jobseekers 
router.get('/', async (req, res) => {
  try {
    const jobs = await Job.find().populate('employer', 'companyName');
    res.json(jobs);
  } catch(err) {
    res.status(500).json({ msg: err.message });
  }
});

// Get jobs for logged-in employer 
router.get('/employer', authenticate, authorize('employer'), async (req, res) => {
  try {
    const jobs = await Job.find({ employer: req.user.id });
    res.json(jobs);
  } catch (err) {
    console.error('Get employer jobs error:', err);
    res.status(500).json({ msg: err.message || 'Failed to fetch employer jobs' });
  }
});

// Update job (only owner)
router.put('/:id', authenticate, authorize('employer'), async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ msg: 'Job not found' });
    if (!job.employer || job.employer.toString() !== req.user.id) return res.status(403).json({ msg: 'Unauthorized' });
    Object.assign(job, req.body);
    await job.save();
    res.json(job);
  } catch(err) {
    console.error('Update job error:', err);
    res.status(500).json({ msg: err.message || 'Failed to update job' });
  }
});

// Basic recommendations for jobseeker based on skills
// GET /api/jobs/recommendations
router.get('/recommendations', authenticate, authorize('jobseeker'), async (req, res) => {
  try {
    const user = await require('../models/user').findById(req.user.id);

    // Split skills into keywords
    let skills = [];
    if (Array.isArray(user.skills)) {
      skills = user.skills
        .flatMap(s => s.split(/[ ,]+/))  // split by space or comma
        .map(w => w.trim())
        .filter(Boolean);
    }

    console.log("Processed skills:", skills);

    let jobs;
    if (skills.length > 0) {
      const orQueries = skills.map(s => ({
        $or: [
          { requirements: new RegExp(s, 'i') },
          { title: new RegExp(s, 'i') }
        ]
      }));

      jobs = await Job.find({ $or: orQueries })
        .limit(20)
        .populate('employer', 'companyName');
    } else {
      jobs = await Job.find()
        .limit(10)
        .populate('employer', 'companyName');
    }

    // If nothing found, return recent jobs
    if (!jobs || jobs.length === 0) {
      jobs = await Job.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('employer', 'companyName');
    }

    // Exclude applied jobs
    const applied = await Application.find({ jobSeeker: req.user.id }).select('job');
    const appliedIds = applied.map(a => a.job.toString());
    const filtered = jobs.filter(j => !appliedIds.includes(j._id.toString()));

    console.log("Jobs returned:", filtered.length);

    res.json(filtered);
  } catch (err) {
    console.error("Recommendation error:", err);
    res.status(500).json({ msg: err.message });
  }
});



// Delete job (only owner) — also cleanup application files (resumes uploaded per application)
router.delete('/:id', authenticate, authorize('employer'), async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ msg: 'Job not found' });
    if (!job.employer || job.employer.toString() !== req.user.id) return res.status(403).json({ msg: 'Unauthorized' });

    // find applications for this job
    const applications = await Application.find({ job: job._id });

    // delete application resumes (files stored on disk), then delete application docs
    for (const app of applications) {
      if (app.resume) {
        try {
          const full = path.isAbsolute(app.resume) ? app.resume : path.join(process.cwd(), app.resume);
          if (fs.existsSync(full)) {
            fs.unlinkSync(full);
          }
        } catch (e) {
          console.warn('Failed to delete application resume file', app.resume, e);
        }
      }
    }

    // remove application documents for this job
    await Application.deleteMany({ job: job._id });

    // finally remove the job
    await Job.findByIdAndDelete(job._id);

    res.json({ msg: 'Job and associated application files deleted' });
  } catch(err) {
    console.error('Delete job error:', err);
    res.status(500).json({ msg: err.message || 'Failed to delete job' });
  }
});

module.exports = router;