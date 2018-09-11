// if production use MLAB else use local DB
if (process.env.NODE_ENV === "production") {
  module.exports = {mongoURI: 'mongodb://hero:a12345@ds151402.mlab.com:51402/blogs-crud-app'}
} else {
  module.exports = {mongoURI: "mongodb://localhost/blog-dev"}
}
