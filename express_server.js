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

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
}

// ShortURL generator function
function generateRandomString() {
  return Math.random().toString(36).substring(2,8)
}

// GET routes under here

app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  let templateVars = {
    urlDatabase: urlDatabase,
    users: users,
    username: req.cookies["user ID"]
  }
  res.render("register", {
    templateVars: templateVars
  });
});

app.get("/login", (req, res) => {
  let templateVars = {
    users: users,
    username: req.cookies["user ID"]}
  res.render("login", {
    templateVars: templateVars
  });
});

app.get("/urls", (req, res) => {
  let templateVars = {
    urlDatabase: urlDatabase,
    users: users,
    username: req.cookies["user ID"]
  };
  res.render("urls_index", {
    templateVars: templateVars
  });
});

app.get("/urls/new", (req, res) => {
  let templateVars = {
    users: users,
    username: req.cookies["user ID"]
  };
  res.render("urls_new", {
    templateVars: templateVars
  });
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    users: users,
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    username: req.cookies["user ID"]
  };
  res.render("urls_show", {
    templateVars: templateVars,
    users: users
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

app.post("/register", (req, res) => {
  let pWord = req.body.password
  let userMail = req.body.email
  let userID = generateRandomString()

  for (var existing in users) {
    if (userMail === users[existing]["email"]) {
      res.send("E-mail already registered!");
    }
  }

  users[userID] = {
    id: userID,
    email: userMail,
    password: pWord
  };

  res.cookie("user ID", users[userID]["id"]);
  res.redirect("/urls");
  });

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
  let inputMail = req.body.email;
  let inputPWord = req.body.password;

  for (var existing in users) {
    if (users[existing]["email"] == inputMail) {
      if (users[existing]["password"] == inputPWord) {
        res.cookie("user ID", users[existing]["id"])
        return res.redirect("/urls");
      } else {
        return res.send("Wrong password!");
      }
    }
  }
  res.send("Your e-mail address is not registered");
});

app.post("/logout", (req, res) => {
  res.clearCookie("user ID");
  res.redirect("/urls");
});

// server listening on PORT

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});