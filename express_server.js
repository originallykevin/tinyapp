const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

app.set("view engine", "ejs");

app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const generateRandomString = () => {
  return Math.random().toString(36).substring(2, 8);
};


// submit handle for new url items
app.post("/urls", (req, res) => {
  const id = generateRandomString();
  console.log(req.body); // Log the POST request body to the console
  urlDatabase[id] = req.body.longURL;
  res.redirect(`/urls/${id}`);
});

// COOKIE - POST urls/login
app.post('/login', (req, res) => {
  const cookie = req.body.username;
  console.log('req.body.username', req.body.username)
  res.cookie("username", cookie);
  res.redirect('/urls');
});

// POST urls/logout
app.post('/logout', (req, res) => {
  console.log('cookie', res)
  const cookie = req.body.username;
  res.clearCookie("username", cookie);
  res.redirect('/urls');
});

// DELETE - POST /u/:id/delete
app.post('/urls/:id/delete', (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect('/urls');
});

// EDIT - POST
app.post('/urls/:id', (req, res) => {
  const id = req.params.id;
  urlDatabase[id] = req.body.newURLname;
  res.redirect('/urls');
});

// Cookie-parser
app.get('/', function(req, res) {
  // Cookies that have not been signed
  console.log('Cookies: ', req.cookies);
  // Cookies that have been signed
  console.log('Signed Cookies: ', req.signedCookies);
});

// BROWSE - GET /urls 
app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    username: req.cookies.username,
  };
  res.render("urls_index", templateVars);
});

// READ - GET /u/:id
app.get('/u/:id', (req, res) => {
  const longURL = urlDatabase[req.params.id];
  if (longURL === undefined) {
    res.render('404');
  } else {
    res.redirect(longURL);
  }
});

// GET req to add new url
app.get("/urls/new", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    username: req.cookies.username,
  };
  res.render("urls_new", templateVars);
});

// GET new short url page
app.get("/urls/:id", (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
  };
  res.render("urls_show", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/", (req, res) => {
  res.redirect('/urls');
});

// add page error for all other paths
app.get('*', (req, res) => [
  res.status(404).render('404')
]);

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});