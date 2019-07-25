const express = require('express');
const bodyParser = require('body-parser')
const routes = require('./routes')
const database = require('./services/database');
const Promise = require('bluebird');

Promise.onPossiblyUnhandledRejection(function(error){
    throw error;
});

const app = express();
const port = 3111;

app.use(bodyParser.json());

routes(app);

database.init().then(() => {
  app.listen(port, async () => {
    console.log(`Meter reading server listening on port ${port}!`);
  });
})
