const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

app.set("view engine", "ejs");

app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Old database
// const urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"
// };

// NEW database
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
  h31l0u: {
    longURL: "https://www.github.com",
    userID: "myUser",
  },
  b2xVn2: {
    longURL: "http://www.lighthouselabs.ca",
    userID: "myUser",
  }
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
  myUser: {
    id: "myUser",
    email: "a@b.com",
    password: "1234",
  }
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

// user can only see their database 
const urlsForUser = function(database, userID) {
  let newDatabase = {};
  for (let url in database) {
    if (database[url].userID === userID) {
      newDatabase[url] = database[url].longURL;
    }
  }
  return newDatabase;
};
// console.log(urlsForUser(urlDatabase, "aJ48lW"));
// console.log(urlsForUser(urlDatabase, "myUser"));

// create random 6 letter/nmber string for an id tag
const generateRandomString = () => {
  return Math.random().toString(36).substring(2, 8);
};


// submit handle for new url items
app.post("/urls", (req, res) => {

  // prevent users not logged in from POST /urls for security measures
  const user_id = req.cookies.user_id;
  if (!user_id) {
    res.send('Please login to shorten URL');
  }
  const id = generateRandomString();
  console.log(req.body); // Log the POST request body to the console
  urlDatabase[id] = {
    longURL: `http://${req.body.longURL}`,
    userID: user_id,
  };
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
  const user_id = req.cookies['user_id'];
  const id = req.params.id;
  // urlDatabase[id] = req.body.newURLname;
  urlDatabase[id] = {
    longURL: `http://${req.body.newURLname}`,
    userID: user_id,
  };
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
  const user_id = req.cookies['user_id']
  // if user is logged in, /login will redirect to /urls
  if (req.cookies.user_id) {
    res.redirect('/urls');
  }
  const templateVars = {
    user: users[user_id],
  };
  res.render("login", templateVars);
});

app.get('/register', (req, res) => {
  const user_id = req.cookies['user_id'];
  // if user is logged in, /register will redirect to /urls
  if (user_id) {
    res.redirect('/urls');
  }
  const templateVars = {
    user: users[user_id],
  };
  res.render("registration", templateVars);
});

// BROWSE - GET /urls 
app.get("/urls", (req, res) => {
  const user_id = req.cookies['user_id'];
  const templateVars = {
    urls: urlsForUser(urlDatabase, user_id),
    user: users[user_id], // this has value of generated id
  };
  res.render("urls_index", templateVars);
});

// READ - GET /u/:id
app.get('/u/:id', (req, res) => {
  // if user tries to access a shorten url not in database
  if (!req.params.id) {
    res.send('Does not exist in database');
  }
  const longURL = urlDatabase[req.params.id].longURL;
  // url is not found then it will be directed to 404.ejs
  if (longURL === undefined) {
    res.render('404');
  } else {
    res.redirect(longURL);
  }
});

// GET req to add new url
app.get("/urls/new", (req, res) => {
  const user_id = req.cookies['user_id'];
  // if user is not logged in, redirect to /login
  if (!user_id) {
    res.redirect('/login');
  }
  const templateVars = {
    urls: urlsForUser(urlDatabase, user_id),
    user: users[user_id],
  };
  res.render("urls_new", templateVars);
});

// GET new short url page
app.get("/urls/:id", (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
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