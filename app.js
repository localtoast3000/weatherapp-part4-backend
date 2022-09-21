// require('dotenv').config({ path: '.env' });

const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const connectToDatabase = require('./models/connection.js');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const weatherRouter = require('./routes/weather');

connectToDatabase();
const app = express();

const cors = require('cors');
app.use(cors());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/weather', weatherRouter);

module.exports = app;
