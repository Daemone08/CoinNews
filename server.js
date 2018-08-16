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
app.get("/scrape", function (req, res) {
    // Grab the HTML body using request
    axios.get("http://www.cointelegraph.com/").then(function (response) {
        // $ is shorthand for HTML body
        var $ = cheerio.load(response.data);

        // Now, we grab every image within a post tag, and do the following:
        $(".post .image a").each(function (i, element) {
            // Save an empty result object
            var result = {};
            
            // HERES WHERE THE LOGIC GOES TO AVOID DUPLICATES
            // HERES WHERE THE LOGIC GOES TO AVOID DUPLICATES
            // HERES WHERE THE LOGIC GOES TO AVOID DUPLICATES

            // Add the alt-text, text, and href of every link, and save them as properties of the result object
            result.title = $(this)
                .children("img")
                .attr("alt");
            result.summary = $(this)
                .children(".lead")
                .text();
            result.link = $(this)
                .attr("href");

            // Create a new Article using the `result` object built from scraping
            db.Article.create(result)
                .then(function (dbArticle) {
                    // View the added result in the console
                    console.log(dbArticle);
                })
                .catch(function (err) {
                    // If an error occurred, send it to the client
                    return res.json(err);
                });
        });

        // If we were able to successfully scrape and save an Article, send a message to the client
        res.send("Scrape Complete");
    });
});

// HTML ROUTES

// Route for all articles
app.get("/articles", function (req, res) {
    // find query with no filter to find all
    db.Article.find({})
        .then(function (dbArticle) {
            // send json of article document
            res.json(dbArticle);
        })
        // error catch
        .catch(function (err) {
            res.json(err);
        });
});

// Route for one specific article
app.get("/articles/:id", function (req, res) {
    // use req.params and a find query with a filter on id
    db.Article.findOne({ _id: req.params.id })
        // populate method allows user to see specific details (properties) of the note
        .populate("note")
        .then(function (dbArticle) {
            // if found send the json
            res.json(dbArticle);
        })
        // error catch
        .catch(function (err) {
            res.json(err);
        });
});

// Post route for updating article note
app.post("/articles/:id", function (req, res) {
    // Create a new note and pass the req.body to the entry
    db.Note.create(req.body)
        .then(function (dbNote) {
            // user findOneAndUpdate method with two filters. specify true to return the modified document.
            return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
        })
        .then(function (dbArticle) {
            // if succesful send the JSON
            res.json(dbArticle);
        })
        // error catch
        .catch(function (err) {
            res.json(err);
        });
});

// Start the server
app.listen(PORT, function () {
    console.log("App running on port " + PORT + "!");
});
