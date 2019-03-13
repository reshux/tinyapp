var express = require("express");
var app = express();
const cookieParser = require("cookie-parser");
var PORT = 8080; // default port 8080
const bodyParser = require("body-parser");

//

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser())
app.set("view engine", "ejs")

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


// ShortURL generator function
function generateRandomString() {
  return Math.random().toString(36).substring(2,8)
}

// GET routes under here

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  let templateVars ={
    urlDatabase: urlDatabase,
    username: req.cookies["username"]
  };
  res.render("urls_index", {
    templateVars: templateVars
  });
});

app.get("/urls/new", (req, res) => {
  let templateVars ={
    username: req.cookies["username"]
  };
  res.render("urls_new", {
    templateVars: templateVars
  });
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    username: req.cookies["username"]
  };
  res.render("urls_show", {
    templateVars: templateVars
  });
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/u/:shortURL", (req, res) => {
  var shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});

// POST routes under here

app.post("/urls/:shortURL/delete", (req, res) => {
  var shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

app.post("/urls/:shortURL", (req, res) => {
  var shortURL = req.params.shortURL;
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  var longURL = req.body.longURL;
  var shortURL = generateRandomString();
  urlDatabase[shortURL] = longURL;
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  let username = req.body.username;
  res.cookie("username", username);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
});

// server listening on PORT

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});