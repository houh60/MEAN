const express = require('express');
const bodyParser = require('body-parser');

const mongoose = require('mongoose');

const Post = require('./models/post');

const app = express();

mongoose.connect('mongodb+srv://William:SfnPbwaVfdYD6C0x@cluster0.gkvfa.mongodb.net/node-angular?retryWrites=true&w=majority')
    .then(() => {
        console.log('Connected to database!');
    }).catch(() => {
        console.log('Connection failed!');
    });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PATCH, DELETE');
    next();
});

app.post('/api/posts', (req, res, next) => {
    const post = new Post({
        title: req.body.title,
        content: req.body.content
    });
    post.save().then(createdPost => {
        res.status(201).json({
            message: 'Post added successfully!',
            postId: createdPost._id
        });
    });
});

app.get('/api/posts', (req, res, next) => {
    Post.find().then(decuments => {
        res.status(200).json({
            message: 'Posts fetched successfully!',
            posts: decuments
        });
    }).catch(error => {
        console.log('error: ', error);
    });
});

app.delete('/api/posts/:id', (req, res, next) => {
    Post.deleteOne({ _id: req.params.id }).then(result => {
        console.log('result: ', result);
        res.status(200).json({ message: 'Post deleted!' });
    });

});

module.exports = app;
