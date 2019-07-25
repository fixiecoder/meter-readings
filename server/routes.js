const controllers = require('./controllers/readings');
const { authMiddleware } = require('./middleware/authentication');

module.exports = (app) => {
  app.post('/meter-read', authMiddleware, controllers.submitReading);
  app.get('/meter-read/customer/:customerId/meter/:serialNumber', authMiddleware, controllers.getReadings);
}