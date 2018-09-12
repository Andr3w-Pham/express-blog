const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const methodOverride = require('method-override');

// bring in the helper ensure authenticated function
const {ensureAuthenticated} = require('../helper/auth')

// Require model
require('../models/Blog')
// Create user model
const Blog = mongoose.model('blogs');


// add form
router.get('/new', ensureAuthenticated, (req, res) => {
  res.render('blogs/new')
})

//post route to save to the DB
router.post('/', (req, res) => {
  console.log('in the post route');
  console.log(req.body);
  // res.send('ok');
  let errors = [];
  if (!req.body.title) {
    errors.push({text: "Title must be present"});
  }
  if (!req.body.description) {
    errors.push({text: "Description must be present"});
  }
  if (errors.length > 0) {
    res.render('blogs/new', {
      title: req.body.title,
      description: req.body.description,
      errors: errors,
    });

  } else {
    // save to db
    // res.send('passed');
    let newBlog = {
      title: req.body.title,
      description: req.body.description,
      // update user id to the blog & saving that to the DB
      user: req.user.id
    }
    new Blog(newBlog)
    .save()
    .then(blogs => {
      console.log(blogs)
      res.redirect('/');
    })
    .catch(err => console.log(err));
  }
})
// show all blogs from database
router.get('/index', (req, res) => {
  Blog.find()
  .then(blogs => {

    console.log(blogs);
    res.render('blogs/index', {
      blogs:blogs
    });
  })
  .catch(err => console.log(err));
});

router.get('/:id/edit', ensureAuthenticated, (req, res) => {
  Blog.findById({
    _id: req.params.id
  })
  .then(blog => {
    // if the blog does not belong to logged in user
    if(blog.user != req.user.id) {
      // redirect back to home page
      req.flash("error_msg", "Access Denied");
      res.redirect('/');
    } else {
      console.log(blog)
      res.render('blogs/edit', {
         blog: blog
      });
    }
  })
});

router.put('/:id', (req, res) => {
  Blog.findById({
    _id: req.params.id
  })
  .then(blog => {
    // update the blog with new values from the form
    blog.title = req.body.title,
    blog.description = req.body.description
    // save the updated blog
    blog.save()
      .then(() => res.redirect('/blogs/index'))
      .catch((err) => console.log(err));
  });

});

// Delete the Blog
// router.delete('/:id', ensureAuthenticated, (req, res) => {
//   Blog.remove({
//     _id: req.params.id
//   })
//   .then(() => {
//     req.flash('success_msg', 'You have successfully deleted the blog');
//     res.redirect('/blogs/index');
//   })
//   .catch(err => console.log(err));
// })

// Delete the Blog
router.delete('/:id', ensureAuthenticated, (req, res) => {
  Blog.findById({
    _id: req.params.id
  })
  .then(blog => {
    // if the blog does not belong to logged in user
    if(blog.user != req.user.id) {
      // redirect back to home page
      req.flash('error_msg', 'Access Denied');
      res.redirect('/');
      // delete only if current user's blog
    } else {
      blog.remove()
      .then(() => {
        req.flash('success_msg', 'You have successfully deleted the blog');
        res.redirect('/blogs/index');
      })
      .catch(err => console.log(err));
    }
  })
})
module.exports = router;
