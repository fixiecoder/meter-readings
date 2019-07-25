const { checkAuth } = require('../services/authentication');

const authMiddleware = async (req, res, next) => {
  console.log('HTIS')
  const isAuthenticated = await checkAuth(req);
  if(isAuthenticated) {
    next();
  } else {
    res.sendStatus(401);
  }
}

module.exports = { authMiddleware };