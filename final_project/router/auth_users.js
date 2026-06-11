const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
  // Check if a user with this username already exists
  let userswithsamename = users.filter((user) => {
    return user.username === username;
  });
  return userswithsamename.length > 0;
}

const authenticatedUser = (username,password)=>{ //returns boolean
  // Check if username and password match a record we have
  let validusers = users.filter((user) => {
    return (user.username === username && user.password === password);
  });
  return validusers.length > 0;
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(404).json({message: "Username and password are required"});
  }

  if (!authenticatedUser(username, password)) {
    return res.status(208).json({message: "Invalid Login. Check username and password"});
  }

  // Generate a JWT access token for the session
  let accessToken = jwt.sign({
    data: password
  }, 'access', { expiresIn: 60 * 60 });

  // Store the token and username in the session
  req.session.authorization = {
    accessToken, username
  }

  return res.status(200).json({message: "User successfully logged in"});
});

// Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;
  const username = req.session.authorization.username;

  const book = books[isbn];

  if (!book) {
    return res.status(404).json({message: "Book not found for the given ISBN"});
  }

  if (!review) {
    return res.status(400).json({message: "Review text is required as a query parameter"});
  }

  // Add a new review or modify the existing one for this user
  book.reviews[username] = review;

  return res.status(200).json({
    message: `The review for the book with ISBN ${isbn} has been added/updated`,
    reviews: book.reviews
  });
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization.username;

  const book = books[isbn];

  if (!book) {
    return res.status(404).json({message: "Book not found for the given ISBN"});
  }

  if (book.reviews[username] !== undefined) {
    delete book.reviews[username];
    return res.status(200).json({
      message: `The review for the book with ISBN ${isbn} has been deleted`,
      reviews: book.reviews
    });
  } else {
    return res.status(404).json({message: "No review by this user found for the given ISBN"});
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;