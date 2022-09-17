const express = require('express');
const multer = require('multer');
const router = express.Router();
const Post = require('../models/post');
const fs = require('fs');

const MIME_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg',
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const isValid = MIME_TYPE_MAP[file.mimetype];
        let error = new Error('Invalid mime type');
        if(isValid) {
            error = null;
        }
        cb(error, 'backend/images')
    },
    filename: (req, file, cb) => {
        const name = file.originalname.toLowerCase().split(' ').join('-');
        const ext = MIME_TYPE_MAP[file.mimetype];
        cb(null, name + '-' + Date.now() + '.' + ext);
    }
});

router.post('', multer({ storage: storage }).single('image'), (req, res, next) => {
    const url = req.protocol + '://' + req.get('host');
    const post = new Post({
        title: req.body.title,
        content: req.body.content,
        imagePath: url + '/images/' + req.file.filename
    });
    post.save().then(createdPost => {
        res.status(201).json({
            message: 'Post added successfully!',
            post: {
                ...createdPost,
                id: createdPost._id
            }
        });
    });
});

router.put('/:id', multer({ storage: storage }).single('image'), (req, res, next) => {
    let imagePath = req.body.imagePath;
    let path = req.headers.path;
    if(req.file) {
        const url = req.protocol + '://' + req.get('host');
        imagePath = url + '/images/' + req.file.filename;
    }
    const post = new Post({
        _id: req.body.id,
        title: req.body.title,
        content: req.body.content,
        imagePath: imagePath
    });
    Post.updateOne({ _id: req.params.id }, post).then(() => {
        if(req.file) {
            deletePicture(path);
        }
        res.status(200).json({ message: 'Update was successful!' });
    });
});

router.get('', (req, res, next) => {
    const pageSize = +req.query.pagesize;
    const currentPage = req.query.page;
    const postQuery = Post.find();
    let fetchedPosts;
    if(pageSize && currentPage) {
        postQuery.skip(pageSize * (currentPage - 1)).limit(pageSize);
    }
    postQuery.then(documents => {
        fetchedPosts = documents;
        return Post.count();
    }).then(() => {
        res.status(200).json({
            message: 'Posts fetched successfully!',
            posts: fetchedPosts
        });
    }).catch(error => {
        console.log('error: ', error);
    });
});

router.get('/:id', (req, res, next) => {
    Post.findById(req.params.id).then(post => {
        if(post) {
            res.status(200).json(post);
        } else {
            res.status(404).json({ message: 'Post not found!' });
        }
    });
});

router.delete('/:id', (req, res, next) => {
    let path = req.headers.path;
    Post.deleteOne({ _id: req.params.id }).then(() => {
        deletePicture(path);
        res.status(200).json({ message: 'Post deleted!' });
    });
});

function deletePicture(path) {
    fs.unlink(path, function(err) {
        if(err) {
            console.log('err: ', err);
        }
    });
}

module.exports = router;
