const { checkAuth } = require('../services/authentication');

const authMiddleware = async (req, res, next) => {
  const isAuthenticated = await checkAuth(req);
  if(isAuthenticated) {
    next();
  } else {
    res.sendStatus(401);
  }
}

module.exports = { authMiddleware };