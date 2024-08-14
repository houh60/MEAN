const Post = require('../models/post');
const fs = require('fs');

exports.createPost = (req, res, next) => {
    const url = req.protocol + '://' + req.get('host');
    const post = new Post({
        title: req.body.title,
        content: req.body.content,
        imagePath: url + '/images/' + req.file.filename,
        creator: req.userData.userId
    });
    post.save().then(createdPost => {
        res.status(201).json({
            message: 'Post added successfully!',
            post: {
                ...createdPost,
                id: createdPost._id
            }
        });
    }).catch(error => {
        res.status(500).json({
            error: error
        });
    });
};

exports.updatePost = (req, res, next) => {
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
        imagePath: imagePath,
        creator: req.userData.userId
    });
    Post.updateOne({ _id: req.params.id, creator: req.userData.userId }, post).then(result => {
        if(result.matchedCount > 0) {
            if(req.file) {
                deletePicture(path);
            }
            res.status(200).json({ message: 'Update was successful!' });
        } else {
            res.status(401).json({ message: 'You are not authorized!' });
        }
    }).catch(error => {
        res.status(500).json({
            error: error
        });
    });
};

exports.getPosts = (req, res, next) => {
    const pageSize = +req.query.pagesize;
    const currentPage = req.query.page;
    const postQuery = Post.find();
    let fetchedPosts;
    if(pageSize && currentPage) {
        postQuery.skip(pageSize * (currentPage - 1)).limit(pageSize);
    }
    postQuery.then(documents => {
        fetchedPosts = documents;
        return Post.countDocuments();
    }).then(count => {
        res.status(200).json({
            message: 'Posts fetched successfully!',
            posts: fetchedPosts,
            maxPosts: count
        });
    }).catch(error => {
        res.status(500).json({
            error: error
        });
    });
};

exports.getPost = (req, res, next) => {
    Post.findById(req.params.id).then(post => {
        if(post) {
            res.status(200).json(post);
        } else {
            res.status(404).json({ message: 'Post not found!' });
        }
    }).catch(error => {
        res.status(500).json({
            error: error
        });
    });
};

exports.deletePost = (req, res, next) => {
    let path = req.headers.path;
    Post.deleteOne({ _id: req.params.id, creator: req.userData.userId }).then(result => {
        if(result.deletedCount > 0) {
            deletePicture(path);
            res.status(200).json({ message: 'Post deleted!' });
        } else {
            res.status(401).json({ message: 'You are not authorized!' });
        }
    }).catch(error => {
        res.status(500).json({
            error: error
        });
    });
};

function deletePicture(path) {
    fs.unlink(path, function(err) {
        if(err) {
            console.log('err: ', err);
        }
    });
}
