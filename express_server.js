const express = require("express");
const morgan = require('morgan');
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = 8080; 

app.set("view engine", "ejs");

//////// MIDDLEWARE /////////
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(cookieSession({
  name: 'cookieMonster',
  keys: ['anything', 'something'],
}));

//////// HELPER FUNCTIONS /////////
const { getUserByEmail, urlsForUser, generateRandomString } = require('./helpers');

// New database
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "myUser",
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
    longURL: "https://www.lighthouselabs.ca",
    userID: "myUser",
  }
};

// store and access the users in the app.
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10),
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", 10),
  },
  myUser: {
    id: "myUser",
    email: "a@b.com",
    password: bcrypt.hashSync("1234", 10)
  }
};

// submit handle for new url items
app.post("/urls", (req, res) => {
  const user_id = req.session.user_id;
  if (!user_id) {
    return res.status(403).send('Please login to shorten URL.');
  }
  const id = generateRandomString();
  urlDatabase[id] = {
    longURL: req.body.longURL,
    userID: user_id,
  };
  res.redirect(`/urls/${id}`);
});

// logging into app
app.post("/login", (req, res) => {
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  const user_id = getUserByEmail(userEmail, users);
  if (!user_id) {
    return res.status(403).send('No user with that username found.');
  }
  const result = bcrypt.compareSync(userPassword, users[user_id].password);
  if (users[user_id].email === userEmail && result) {
    req.session.user_id = user_id;
    return res.redirect("/urls");
  } else {
    return res.status(403).send('username or password does not match.');
  }
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

// deleting a url
app.post("/urls/:id/delete", (req, res) => {
  const user_id = req.session['user_id'];
  const id = req.params.id;
  if (!urlDatabase[id]) {
    return res.status(404).send('This shortURL does not exist.');
  }
  if (!user_id || urlDatabase[id].userID !== user_id) {
    return res.status(403).send('You do not have access to this page.');
  }
  delete urlDatabase[id];
  res.redirect("/urls");
});

// upate existing short url
app.post("/urls/:id", (req, res) => {
  const user_id = req.session['user_id'];
  const id = req.params.id;
  if (!urlDatabase[id]) {
    return res.status(404).send('This shortURL does not exist.');
  }
  if (!user_id || urlDatabase[id].userID !== user_id) {
    return res.status(403).send('You do not have access to this page.');
  }
  urlDatabase[id] = {
    longURL: req.body.newURLname,
    userID: user_id,
  };
  res.redirect("/urls");
});


// register new user and password
app.post("/register", (req, res) => {
  const user_id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    return res.status(404).send('Please enter email and password.');
  }
  if (getUserByEmail(email, users)) {
    return res.status(404).send('A user with that email already exists.');
  }
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);

  users[user_id] = {
    email,
    password: hash
  };
  req.session.user_id = user_id;
  return res.redirect("/urls");
});

app.get("/login", (req, res) => {
  const user_id = req.session['user_id'];
  if (user_id) {
    return res.redirect('/urls');
  }
  const templateVars = {
    user: users[user_id],
  };
  res.render("login", templateVars);
});

app.get("/register", (req, res) => {
  const user_id = req.session['user_id'];
  if (user_id) {
    return res.redirect('/urls');
  }
  const templateVars = {
    user: users[user_id],
  };
  res.render("registration", templateVars);
});

// BROWSE - GET /urls 
app.get("/urls", (req, res) => {
  const user_id = req.session['user_id'];
  const urls = urlsForUser(urlDatabase, user_id);
  if (!user_id) {
    return res.redirect("/login");
  }
  const templateVars = {
    urls,
    user: users[user_id],
  };
  res.render("urls_index", templateVars);
});

// READ - GET /u/:id
app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  if (!urlDatabase[id]) {
    return res.status(404).send('This short url does not exist.');
  } else {
    const longURL = urlDatabase[id].longURL;
    res.redirect(longURL);
  }
});

// GET req to add new url
app.get("/urls/new", (req, res) => {
  const user_id = req.session['user_id'];
  if (!user_id) {
    return res.redirect('/login');
  }
  const templateVars = {
    urls: urlsForUser(urlDatabase, user_id),
    user: users[user_id],
  };
  res.render("urls_new", templateVars);
});

// GET new short url page
app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const user_id = req.session['user_id'];
  if (!user_id) {
    return res.status(403).send('You do not have access to this page.');
  }
  if (!urlDatabase[id]) {
    return res.status(404).send('This short url does not exist.');
  }
  if (urlDatabase[id].userID !== user_id) {
    return res.status(403).send('You do not have access to this short url.');
  }
  const templateVars = {
    id: id,
    longURL: urlDatabase[id].longURL,
  };
  res.render("urls_show", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/", (req, res) => {
  const user_id = req.session['user_id'];
  if (!user_id) {
    return res.redirect("/login");
  }
  res.redirect("/urls");
});

// add page error for all other paths
app.get("*", (req, res) => [
  res.status(404).render('404')
]);

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}!`);
});