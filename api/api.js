const express = require('express');
const api = express.Router();
const employeeRouter = require('./employee');

api.use('/employees', employeeRouter);

module.exports = api; 