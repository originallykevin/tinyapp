const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const generateRandomString = () => {
  return Math.random().toString(36).substring(2, 8);
}

app.use(express.urlencoded({ extended: true }));

// submit handle for new url items
app.post("/urls", (req, res) => {
  const id = generateRandomString()
  console.log(req.body); // Log the POST request body to the console
  // const urlDatabase = {
  //   [id]: req.body.longURL,
  // }
  urlDatabase[id] = req.body.longURL
  res.redirect(`/urls/${id}`)
});

app.get('/u/:id', (req, res) => {
  const longURL = urlDatabase[req.params.id]
  if (longURL === undefined) {
    res.render('404')
  } else {
    res.redirect(longURL);
  }
}); 

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

// GET req to add new url
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/", (req, res) => {
  res.send("Hello Nori!");
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/hello", (req, res) => {
  const templateVars = { greeting: "Hello World!" };
  res.render("hello_world", templateVars);
});

// add page error for all other paths
app.get('*', (req, res) => [
  res.render('404')
])

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});