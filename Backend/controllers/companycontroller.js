const Company = require('../models/company');
const Job = require('../models/job');
const User = require('../models/user');
const path = require('path');
const fs = require('fs');

const COMPANY_DIR = path.join(process.cwd(), 'uploads','company');
if (!fs.existsSync(COMPANY_DIR)) fs.mkdirSync(COMPANY_DIR, { recursive: true });

module.exports = {
  // create a company (employer only)
  async createCompany(req, res) {
    try {
      const { name, description, location, website } = req.body;
      if (!name) return res.status(400).json({ msg: 'Company name required' });

      const existing = await Company.findOne({ name, owner: req.user.id });
      if (existing) return res.status(400).json({ msg: 'Company already exists' });

      const company = new Company({ name, description, location, website, owner: req.user.id });
      await company.save();

      // link user -> company
      await User.findByIdAndUpdate(req.user.id, { company: company._id, companyName: name });

      res.status(201).json({ company });
    } catch (err) {
      console.error('Create company error:', err);
      res.status(500).json({ msg: err.message || 'Failed to create company' });
    }
  },

  // update company (owner only)
  async updateCompany(req, res) {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) return res.status(404).json({ msg: 'Company not found' });
    if (!company.owner || company.owner.toString() !== req.user.id)
      return res.status(403).json({ msg: 'Unauthorized' });

    const { name, description, location, website } = req.body;

    if (name) company.name = name;
    if (description) company.description = description;
    if (location) company.location = location;
    if (website) company.website = website;

    // If upload file exists (logo update)
    if (req.file) {
      if (company.logo) {
        const prev = path.isAbsolute(company.logo)
          ? company.logo
          : path.join(process.cwd(), company.logo);
        if (fs.existsSync(prev)) {
          try { fs.unlinkSync(prev); } catch (e) { console.warn(e); }
        }
      }

      const relative = path.relative(process.cwd(), req.file.path).split(path.sep).join("/");
      company.logo = relative;
    }

    await company.save();
    await User.findByIdAndUpdate(req.user.id, { companyName: company.name });

    res.json({ msg: "Company updated successfully", company });
  } catch (err) {
    console.error("Update company error:", err);
    res.status(500).json({ msg: err.message || "Failed to update company" });
  }
},

  // upload company logo
  async uploadLogo(req, res) {
    try {
      if (!req.file) return res.status(400).json({ msg: 'No file uploaded' });
      const company = await Company.findById(req.params.id);
      if (!company) return res.status(404).json({ msg: 'Company not found' });
      if (!company.owner || company.owner.toString() !== req.user.id) return res.status(403).json({ msg: 'Unauthorized' });

      // remove old logo
      if (company.logo) {
        const prev = path.isAbsolute(company.logo) ? company.logo : path.join(process.cwd(), company.logo);
        if (fs.existsSync(prev)) try { fs.unlinkSync(prev); } catch(e){ console.warn(e); }
      }

      const relative = path.relative(process.cwd(), req.file.path).split(path.sep).join('/');
      company.logo = relative;
      await company.save();
      res.json({ msg: 'Logo uploaded', path: relative });
    } catch (err) {
      console.error('Upload logo error:', err);
      res.status(500).json({ msg: err.message || 'Logo upload failed' });
    }
  },

  // get company by id (public) + jobs

  async getCompany(req, res) {
    try {
      const company = await Company.findById(req.params.id);
      if (!company) return res.status(404).json({ msg: 'Company not found' });

      // include company's jobs (jobs posted by owner)
      const jobs = await Job.find({ employer: company.owner }).select('title location salary createdAt');
      res.json({ company, jobs });
    } catch (err) {
      console.error('Get company error:', err);
      res.status(500).json({ msg: err.message || 'Failed to fetch company' });
    }
  },

  // list companies (public)
  async listCompanies(req, res) {
    try {
      const companies = await Company.find().select('name description location logo website');
      res.json(companies);
    } catch (err) {
      console.error('List companies error:', err);
      res.status(500).json({ msg: err.message || 'Failed to list companies' });
    }
  },

  async mine(req, res) {
  try {
    const company = await Company.findOne({ owner: req.user.id });

    if (!company) {
      return res.status(404).json({ msg: "Company not found" });
    }

    res.status(200).json(company);
  } catch (err) {
    console.error("Get my company error:", err);
    res.status(500).json({ msg: "Server error" });
  }
},

  
};
