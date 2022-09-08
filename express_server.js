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

// store and access the users in the app.
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

// check if email is in users{ } for 
const getUserByEmail = function(users, email) {
  for (let user in users) {
    console.log(users[user].email);
    if (users[user].email === email) {
      return user;
    }
  }
};
// getUserByEmail(users, "email")

// create random 6 letter/nmber string for an id tag
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

app.post('/login', (req, res) => {
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  const user_id = getUserByEmail(users, userEmail);
  // check if user email found
  if (!user_id) {
    return res.status(403).render('403');
  }
  // check if user email and user password match
  if (users[user_id].email === userEmail && users[user_id].password === userPassword) {
    res.cookie("user_id", user_id); // cookie with user_id
    res.redirect('/urls');
  } else {
    return res.status(403).render('403');
  }
});

app.post('/logout', (req, res) => {
  res.clearCookie("user_id"); // once logout, cookies will be cleared
  res.redirect('/urls');
});

app.post('/urls/:id/delete', (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect('/urls');
});

app.post('/urls/:id', (req, res) => {
  const id = req.params.id;
  urlDatabase[id] = req.body.newURLname;
  res.redirect('/urls');
});

app.post('/register', (req, res) => {
  const user_id = generateRandomString(); // generate random userID
  const email = req.body.email;
  const password = req.body.password;
  // If the e-mail or password are empty strings, send 404
  if (!email || !password) {
    return res.status(404).render('404');
  }
  // register with an email that is already in the users object, send 404
  if (getUserByEmail(users, email)) {
    return res.status(404).render('404');
  }
  // Move database under if statement above because we want to check email against existing database prior to adding it. 
  users[user_id] = {
    id: user_id,
    email,
    password,
  };
  res.cookie("user_id", user_id);
  res.redirect('/urls');
});

// Cookie-parser
app.get('/', function(req, res) {
  // Cookies that have not been signed
  console.log('Cookies: ', req.cookies);
  // Cookies that have been signed
  console.log('Signed Cookies: ', req.signedCookies);
});

app.get('/login', (req, res) => {
  // if user is logged in, /login will redirect to /urls
  if (req.cookies.user_id) {
    res.redirect('/urls');
  }
  const templateVars = {
    user: users[req.cookies['user_id']],
  };
  res.render("login", templateVars);
});

app.get('/register', (req, res) => {
  // if user is logged in, /register will redirect to /urls
  if (req.cookies.user_id) {
    res.redirect('/urls');
  }
  const templateVars = {
    user: users[req.cookies['user_id']],
  };
  res.render("registration", templateVars);
});

// BROWSE - GET /urls 
app.get("/urls", (req, res) => {
  // console.log("req.cookies['user_id']", req.cookies['user_id'])
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies['user_id']], // this has value of generated id
  };
  res.render("urls_index", templateVars);
});

// READ - GET /u/:id
app.get('/u/:id', (req, res) => {
  const longURL = urlDatabase[req.params.id];
  // url is not found then it will be directed to 404.ejs
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
    user: users[req.cookies['user_id']],
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
  console.log(`Server is listening on port ${PORT}!`);
});