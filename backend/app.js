const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const postsRoutes = require('./routes/posts');

const mongoose = require('mongoose');

const app = express();

mongoose.connect('mongodb+srv://William:SfnPbwaVfdYD6C0x@cluster0.gkvfa.mongodb.net/node-angular?retryWrites=true&w=majority')
    .then(() => {
        console.log('Connected to database!');
    }).catch(() => {
        console.log('Connection failed!');
    });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/images', express.static(path.join('backend/images')));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, path');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PATCH, PUT, DELETE');
    next();
});

app.use('/api/posts', postsRoutes);

module.exports = app;
