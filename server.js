// SERVER AND ROUTING

// REQUIRED PACKAGES
var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");

// FOR SCRAPING
// Axios returns ajax data using promises
// Cheerio returns and models HTML for searching
var axios = require("axios");
var cheerio = require("cheerio");

// ALL MODELS REQUIRED
var db = require("./models");

// CREATE SERVER
// Assign local port
var PORT = 3000;
// Initialize express
var app = express();

// MIDDLEWARE
// Use morgan logger for logging requests
app.use(logger("dev"));
// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: true }));
// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));

// CONNECT TO MONGOOSE DB
// local db is coinNewsHeadlines, if using remotly use heroku db
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/coinNewsHeadlines";
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);

// ROUTES

// Get route for scraping CoinTelegraph. Only run this once.
app.get("/scrape", function(req, res) {
  // Grab the HTML body using request
  axios.get("http://www.cointelegraph.com/").then(function(response) {
    // $ is shorthand for HTML body
    var $ = cheerio.load(response.data);

    // Now, we grab every image within a post tag, and do the following:
    $(".post .image a").each(function(i, element) {
      // Save an empty result object
      var result = {};

      // Add the alt-text, text, and href of every link, and save them as properties of the result object
      result.title = $(this)
        .children("img")
        .attr("alt");
      result.summary = $(this)
        .children(".lead")
        .text();
      result.link = $(this)
        // .children("a")
        .attr("href");

      // Create a new Article using the `result` object built from scraping
      db.Article.create(result)
        .then(function(dbArticle) {
          // View the added result in the console
          console.log(dbArticle);
        })
        .catch(function(err) {
          // If an error occurred, send it to the client
          return res.json(err);
        });
    });

    // If we were able to successfully scrape and save an Article, send a message to the client
    res.send("Scrape Complete");
  });
});

// Route for getting all Articles from the db
app.get("/articles", function(req, res) {
  // TODO: Finish the route so it grabs all of the articles
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function(req, res) {
  // TODO
  // ====
  // Finish the route so it finds one article using the req.params.id,
  // and run the populate method with "note",
  // then responds with the article with the note included
});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function(req, res) {
  // TODO
  // ====
  // save the new note that gets posted to the Notes collection
  // then find an article from the req.params.id
  // and update it's "note" property with the _id of the new note
});

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
