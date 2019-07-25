const controllers = require('./controllers/readings');
const { checkAuth } = require('./services/authentication');

const authMiddleware = async (req, res, next) => {
  const isAuthenticated = await checkAuth(req);
  if(isAuthenticated) {
    next();
  } else {
    res.sendStatus(401);
  }
}

module.exports = (app) => {
  app.post('/meter-read', authMiddleware, controllers.submitReading);
  app.get('/meter-read/customer/:customerId/meter/:serialNumber', authMiddleware, controllers.getReadings);
}