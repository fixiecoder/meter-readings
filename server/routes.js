const controllers = require('./controllers/readings');

module.exports = (app) => {
  app.post('/meter-read', controllers.submitReading);
  app.get('/meter-read/customer/:customerId/meter/:serialNumber', controllers.getReadings);
}