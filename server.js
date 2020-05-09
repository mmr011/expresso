const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const errorhandler = require('errorhandler');
const morgan = require('morgan');
const api = require('./api/api')
const app = express();

const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(bodyParser.json());
app.use(errorhandler());
app.use(morgan('tiny'));

app.use('/api', api);

app.listen(PORT, () => {
    console.log(`Listening to port ${PORT}`);
});

module.exports = app;