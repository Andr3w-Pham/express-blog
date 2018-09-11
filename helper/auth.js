module.exports = {
  // middleware helper function to check if the user has logged in or not.
  ensureAuthenticated: (req, res, next) => {
    if (req.isAuthenticated()) {
      // execute the next function, which in most cases would be route
      return next();
    } else {
      //redirect to login page
      res.redirect('/users/login')
    }
  }

}
