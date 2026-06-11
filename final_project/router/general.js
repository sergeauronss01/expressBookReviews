const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(404).json({message: "Username and password are required"});
  }

  if (isValid(username)) {
    return res.status(404).json({message: "Username already exists"});
  }

  users.push({"username": username, "password": password});
  return res.status(200).json({message: "User successfully registered. Now you can login"});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  return res.status(200).send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book) {
    return res.status(200).send(JSON.stringify(book, null, 4));
  } else {
    return res.status(404).json({message: "Book not found for the given ISBN"});
  }
});
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const author = req.params.author;
  const matchingBooks = {};

  // Obtain all the keys for the 'books' object and iterate through them
  Object.keys(books).forEach((isbn) => {
    if (books[isbn].author === author) {
      matchingBooks[isbn] = books[isbn];
    }
  });

  if (Object.keys(matchingBooks).length > 0) {
    return res.status(200).send(JSON.stringify(matchingBooks, null, 4));
  } else {
    return res.status(404).json({message: "No books found for the given author"});
  }
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const title = req.params.title;
  const matchingBooks = {};

  Object.keys(books).forEach((isbn) => {
    if (books[isbn].title === title) {
      matchingBooks[isbn] = books[isbn];
    }
  });

  if (Object.keys(matchingBooks).length > 0) {
    return res.status(200).send(JSON.stringify(matchingBooks, null, 4));
  } else {
    return res.status(404).json({message: "No books found for the given title"});
  }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book) {
    return res.status(200).send(JSON.stringify(book.reviews, null, 4));
  } else {
    return res.status(404).json({message: "Book not found for the given ISBN"});
  }
});

module.exports.general = public_users;

// ---------------------------------------------------------------------
// Tasks 10-13: The same operations as Tasks 1-4, implemented using
// Promises / Async-Await with Axios. These functions call the running
// server's endpoints above. They can be invoked from a separate test
// script (e.g. node -e "require('./router/general.js').getAllBooksAsync()")
// or imported into a test file with Mocha/Jest.
// ---------------------------------------------------------------------

const BASE_URL = "http://localhost:5000";

// Task 10: Get the list of all books using async-await with Axios
async function getAllBooksAsync() {
  try {
    const response = await axios.get(`${BASE_URL}/`);
    console.log("Task 10 - All books:");
    console.log(JSON.stringify(response.data, null, 4));
    return response.data;
  } catch (error) {
    console.error("Task 10 - Error fetching all books:", error.message);
  }
}

// Task 11: Get book details based on ISBN using a Promise callback with Axios
function getBookByISBNPromise(isbn) {
  return axios.get(`${BASE_URL}/isbn/${isbn}`)
    .then((response) => {
      console.log(`Task 11 - Book details for ISBN ${isbn}:`);
      console.log(JSON.stringify(response.data, null, 4));
      return response.data;
    })
    .catch((error) => {
      console.error(`Task 11 - Error fetching book with ISBN ${isbn}:`, error.message);
    });
}

// Task 12: Get book details based on Author using async-await with Axios
async function getBooksByAuthorAsync(author) {
  try {
    const response = await axios.get(`${BASE_URL}/author/${encodeURIComponent(author)}`);
    console.log(`Task 12 - Books by author ${author}:`);
    console.log(JSON.stringify(response.data, null, 4));
    return response.data;
  } catch (error) {
    console.error(`Task 12 - Error fetching books by author ${author}:`, error.message);
  }
}

// Task 13: Get book details based on Title using a Promise callback with Axios
function getBooksByTitlePromise(title) {
  return axios.get(`${BASE_URL}/title/${encodeURIComponent(title)}`)
    .then((response) => {
      console.log(`Task 13 - Books with title ${title}:`);
      console.log(JSON.stringify(response.data, null, 4));
      return response.data;
    })
    .catch((error) => {
      console.error(`Task 13 - Error fetching books with title ${title}:`, error.message);
    });
}

module.exports.getAllBooksAsync = getAllBooksAsync;
module.exports.getBookByISBNPromise = getBookByISBNPromise;
module.exports.getBooksByAuthorAsync = getBooksByAuthorAsync;
module.exports.getBooksByTitlePromise = getBooksByTitlePromise;