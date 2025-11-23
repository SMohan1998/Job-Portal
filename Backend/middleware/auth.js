const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if(!authHeader) return res.status(401).json({ msg: 'No token, authorization denied' });

    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch(err) {
    console.error("Authentication middleware error: ", err.message || err);
    return res.status(401).json({ msg: 'Token invalid or expired' });
  }
};

const authorize = (roles = []) => {
  if (typeof roles === 'string') roles = [roles];
  return (req, res, next) => {
    if(!req.user) return res.status(401).json({ msg: 'Unauthorized' });
    if(roles.length && !roles.includes(req.user.role))
      return res.status(403).json({ msg: 'Access denied' });
    next();
  };
};

module.exports = { authenticate, authorize };