const express = require('express');
const api = express.Router();
const employeeRouter = require('./employee');
const menuRouter = require('./menu');

api.use('/employees', employeeRouter);
api.use('/menus', menuRouter);

module.exports = api; 