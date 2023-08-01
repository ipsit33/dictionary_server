const mongoose = require('mongoose');
const dotenv = require('dotenv');
const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const cors = require('cors');

dotenv.config({path: './.env'});
require('./db/conn');
// const User = require('./model/UserSchema.js');'

app.use(express.json());
app.use(cors());
app.use(cookieParser());
app.use(require('./router/auth'));

const PORT = process.env.PORT || 8000;


app.listen(PORT,() => {
    console.log(`Server is running at ${PORT} port`);
});
