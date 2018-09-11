// requires express package
const express = require('express');
const app = express();
//handlebar package to render views
const exphbs  = require('express-handlebars');

// mongoose
const mongoose = require('mongoose');

// require body parser to parse through the form content
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
//use express-session to maintain a user's session.
const session = require('express-session')

const passport = require('passport');

// bring in the helper ensure authenticated function
const {ensureAuthenticated} = require('./helper/auth')

const db = require('./config/database')
// if on production use production port else use 3000
const port = process.env.PORT || 3000;

// Load routes
const users = require('./routes/users');
// Load passport config
require('./config/passport')(passport);


// connect to the mongo // Db
mongoose.connect(db.mongoURI, {useNewUrlParser: true})
.then(() => console.log('Connected to DB'))
.catch((err) => console.log(err));

// require the Blog model
require('./models/Blog')
// create a Blog model
const Blog = mongoose.model('blogs');
// middleware for static css files
//////////////////////////////////////////////////////////////
// ALL Middlewaress Starts here
app.use(express.static('public'));
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

// middleware for express handlebars
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

// override with POST having ?_method=DELETE
app.use(methodOverride('_method'));


// express-session middleware must always be placed BEFORE! passport middleware
app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: 'secure',
  resave: false,
  saveUninitialized: true
}))

// passport middleware
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  // declare a  global variable user to be accessd in the views files
  res.locals.user = req.user;
  next();

})

// End of all Middlewares
//////////////////////////////////////////////////////////////
app.get('/', (req, res) => {
  // res.send('Hello World!');
  res.render('home');
});
// About page
app.get('/about', (req, res) => {
  // res.send('about');
  res.render('about');
});

// add form
app.get('/blogs/new', ensureAuthenticated, (req, res) => {
  res.render('blogs/new')
})

//post route to save to the DB
app.post('/blogs', (req, res) => {
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
      res.redirect('/blogs');
    })
    .catch(err => console.log(err));
  }
})
// show all blogs from database
app.get('/blogs', (req, res) => {
  Blog.find()
  .then(blogs => {

    console.log(blogs);
    res.render('blogs/index', {
      blogs:blogs
    });
  })
  .catch(err => console.log(err));
});

app.get('/blogs/:id/edit', ensureAuthenticated, (req, res) => {
  Blog.findById({
    _id: req.params.id
  })
  .then(blog => {
    // if the blog does not belong to logged in user
    if(blog.user != req.user.id) {
      // redirect back to home page
      res.redirect('/');
    } else {
      console.log(blog)
      res.render('blogs/edit', {
         blog: blog
      });
    }
  })
});

app.put('/blogs/:id', (req, res) => {
  Blog.findById({
    _id: req.params.id
  })
  .then(blog => {
    // update the blog with new values from the form
    blog.title = req.body.title,
    blog.description = req.body.description
    // save the updated blog
    blog.save()
      .then(() => res.redirect('/blogs'))
      .catch((err) => console.log(err));
  });

});

// Delete the Blog
// app.delete('/blogs/:id', ensureAuthenticated, (req, res) => {
//   Blog.remove({
//     _id: req.params.id
//   })
//   .then(() => res.redirect('/blogs'))
//   .catch(err => console.log(err));
// })

// Delete the Blog
app.delete('/blogs/:id', ensureAuthenticated, (req, res) => {
  Blog.findById({
    _id: req.params.id
  })
  .then(blog => {
    // if the blog does not belong to logged in user
    if(blog.user != req.user.id) {
      // redirect back to home page
      res.redirect('/');
      // TO DO - delete only if current user's blog
    } else {}
  })
})



// Whenever you hit a route called /users it goes and look for the variable users [const users = require('./routes/users')]
app.use('/users', users);
// start a server
app.listen(port, () => console.log(`Server started on port ${port}`));
