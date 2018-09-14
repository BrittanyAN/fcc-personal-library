/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
var mongoose = require('mongoose');
const MONGODB_CONNECTION_STRING = process.env.DB;
//Example connection: MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {});



module.exports = function (app) {

  // Connecting to database
  mongoose.connect(MONGODB_CONNECTION_STRING);
  
  // Setting up model for database
  var Schema = mongoose.Schema;
  var bookSchema = new Schema({
    title: String,
    comments: [String]
  });
  
  var Book = mongoose.model('Book', bookSchema);
  
  app.route('/api/books')
    .get(function (req, res){
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      Book.find({}).exec(function(err, data) {
        if (err || data.length == 0) {
          res.send("no books exist");
        } else {  
          var result = [];
          data.forEach(function(item) {
            result.push({_id: item._id, title: item.title, commentcount: item.comments.length});
          });
          res.json(result);
        }
      });

    })

    .post(function (req, res){
      var title = req.body.title;
      if (!title) { res.send("no title"); } else {
        //response will contain new book object including atleast _id and title
        Book.findOne({title: title}).exec(function(err, book) {
          if (!book) {
            var newBook = new Book({title: title});
            newBook.save(function(err) {
              res.json({_id: newBook._id, title: newBook.title});
            })
          } else {
            res.send("this title already exists");
          }
        });
      }
    })

    .delete(function(req, res){
      //if successful response will be 'complete delete successful'
      Book.remove({}, function(err) {
        if (err) { 
          res.send("delete unsuccessful"); 
        } else {
          res.send("complete delete successful");
        }
      });
    });



  app.route('/api/books/:id')
    .get(function (req, res){
      var bookid = req.params.id;
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
      Book.findOne({_id: bookid}).exec(function(err, book) {
        if (!book) {
          res.send("invalid id");
        } else {
          res.json({_id: bookid, title: book.title, comments: book.comments});
        }
      });
    })

    .post(function(req, res){
      var bookid = req.params.id;
      var comment = req.body.comment;
      //json res format same as .get
      Book.findOne({_id: bookid}).exec(function(err, book) {
        if (book == []) {
          res.send("book does not exist");
        } else {
        book.comments.push(comment);
        book.save(function(err) {
          if (err) { 
            res.send("update failed"); 
          } else {
            res.json({_id: book._id, title: book.title, comments: book.comments});
          }
        });
        }
      });
    })

    .delete(function(req, res){
      var bookid = req.params.id;
      //if successful response will be 'delete successful'
      Book.findOneAndDelete({_id: bookid}, function(err) {
        if (err) {
          res.send("error: delete unsuccessful");
        } else {
          res.send("delete successful");
        }
      });
    });
    
  
};
