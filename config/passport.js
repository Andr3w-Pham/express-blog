const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');


//Load user model
const User = mongoose.model('users');

// export the passpot authentication function implemented with local strategy
module.exports = (passport) => {
  passport.use(new LocalStrategy({usernameField: 'email'},(email, password, done) => {
    // console.log(email);
    // console.log(password);
    User.findOne({
      email: email
    })
    .then( user => {
      // console.log(user);
      // if user does not exist in the db, throw a msg indicating user was not found
      if (!user){
        return done(null, false, {message: "User not found!"});
      }
      // Compare Password.
      bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err => console.log(err));
        if (isMatch) {
          return done(null, user)
        } else {
          return done(null, false, {message: "Incorret Password!"})
        }
      })
    })
    .catch( err => console.log(err));
  }));
}


// serializeUser & deserializeUser is used to maintain users session
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});
