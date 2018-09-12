const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const passport = require('passport')

// Require model
require('../models/User')
// Create user model
const User = mongoose.model('users');




// Registration Route
// dont need to put /users/register because its already set in app.js
// instead we just need /register
router.get('/register', (req, res,) => {

  res.render('users/register');
});

// post route to capture data from the form and save to db
router.post('/register', (req, res, email) => {
  // res.send('In the post route');
  console.log(req.body);
  let errors = [];
    if (!req.body.name) {
      errors.push({text: "Name must be present"});
    }
    if (!req.body.email) {
      errors.push({text: "Email must be present"});
    }
    if (!req.body.password) {
      errors.push({text: "Password required"});
    }
    if (req.body.password.length < 5) {
      errors.push({text: "Password is too short"});
    }
    if (req.body.password !== req.body.password2) {
      errors.push({text: "Password does not match"});
    }
    if(errors.length > 0) {
      res.render('users/register', {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        password2: req.body.password2,
        errors: errors
      });
    } else {

      // check if email already exists in DB
      // res.send('Passed');
      let newUser = {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password
      }
      //encrypt the password
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
        // Store hash in your password DB.
          if (err => console.log(err))
          // set the encrypted password as the new password in the db
          newUser.password = hash;
          // create User model and insert data to db
          new User(newUser).save()
          .then(users => {
            // redirect to home page
            res.redirect('/');
          })
          .catch(err => console.log(err));
        });
      });
    }
})


router.get('/login', (req, res) => {
  // dont need to put /users/login because its already set in app.js
  // instead we just need /login
  res.render('users/login');
});

// post route for login
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login'
  })(req, res, next);
})

// logout
router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/users/login')
})

module.exports = router;
