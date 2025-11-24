const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { authenticate } = require('../middleware/auth'); // ensure exported or require auth middleware
const sendEmail = require('../utils/sendemail');


const JWT_SECRET = process.env.JWT_SECRET;
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://job-portal-mohans.netlify.app';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

// Registration
router.post('/register', async (req, res) => {
  const { username, email, password, role, companyName } = req.body;
  if (!username || !email || !password || !role) return res.status(400).json({ msg: 'Missing fields' });
  if(!['jobseeker', 'employer'].includes(role)) {
    return res.status(400).json({ msg: 'Invalid role' });
  }
  
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ msg: 'User exists' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ username, email, password: hashedPassword, role });
    if(role === 'employer') {
      newUser.companyName = companyName;
    }
    await newUser.save();

    res.status(201).json({ msg: 'User registered' });
  } catch (err) {
    console.error("Registration error: ", err.message || err);
    res.status(500).json({ error: err.message || "Registration failed" });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ msg: 'Missing fields' });

  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    //const expiresIn = process.env.JWT_EXPIRES_IN || '1h';
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    res.json({ token, userId: user._id, role: user.role });
  } catch (err) {
    console.error("Login error: ", err.message || err);
    res.status(500).json({ error: err.message || "Login failed" });
  }
});

// Change password (authenticated)
router.post('/change-password', authenticate, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) return res.status(400).json({ msg: 'Missing fields' });

  try {
    const user = await User.findById(req.user.id).select('+password');
    if (!user) return res.status(404).json({ msg: 'User not found' });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Current password is incorrect' });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ msg: 'Password changed successfully' });
  } catch (err) {
    console.error("Change password error: ", err.message || err);
    res.status(500).json({ error: err.message || "Change password failed" });
  }
});

// Request password reset (send email using Brevo)
router.post('/request-password-reset', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ msg: 'Email required' });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: 'No user with that email' });

    const token = crypto.randomBytes(20).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    const resetUrl = `${FRONTEND_URL}/reset-password/${token}`;

    const html = `
    <p>You requested to reset your password for Job Portal.</p>
      <p>Click the link below to reset it:</p>
      <a href="${resetUrl}" target="_blank">${resetUrl}</a>
      <p>This link expires in 1 hour.</p>
      `;

    await sendEmail(user.email,'Password Reset - Job Portal', `Reset: ${resetUrl}`,html);

    res.json({ msg: 'Password reset email sent' });
  } catch (err) {
    console.error("Request password reset error: ", err.message || err);
    res.status(500).json({ error: err.message || "Request password reset failed" });
  }
});

// Reset password using token
router.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) return res.status(400).json({ msg: 'Missing fields' });
  try {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ msg: 'Invalid or expired token' });

    user.password = await bcrypt.hash(newPassword, 10);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.json({ msg: 'Password reset successful' });
}
  catch (err) {
    console.error("Reset password error: ", err.message || err);
    res.status(500).json({ error: err.message || "Reset password failed" });
  }
});

module.exports = router;