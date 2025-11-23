const fs = require('fs');
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { authenticate, authorize } = require('../middleware/auth');
const companyController = require('../controllers/companycontroller');
const Company = require("../models/company");



const COMPANY_DIR = path.join(process.cwd(), 'uploads','company');
if (!fs.existsSync(COMPANY_DIR)) {
  fs.mkdirSync(COMPANY_DIR, { recursive: true });
}
const storage = multer.diskStorage({
  destination(req, file, cb) { cb(null, COMPANY_DIR); },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `company-${req.user.id}-${Date.now()}${ext}`);
  }
});
const upload = multer({ storage });

// create company (employer)
router.post('/', authenticate, authorize('employer'), companyController.createCompany);
// get my company (employer)
router.get('/mine', authenticate, authorize('employer'), companyController.mine);

// update company
router.put("/:id", authenticate, authorize('employer'), upload.single("logo"), companyController.updateCompany);

router.put('/:id', authenticate, authorize('employer'), companyController.updateCompany);

// upload logo
//router.post('/:id/logo', authenticate, authorize('employer'), upload.single('logo'), companyController.uploadLogo);

// public get company + jobs
router.get('/:id', companyController.getCompany);

// list companies
router.get('/', companyController.listCompanies);



module.exports = router;
