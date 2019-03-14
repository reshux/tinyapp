var express = require("express");
var app = express();
// const cookieSession = require('cookie-session');
var PORT = 8080; // default port 8080
const cookieSession = require('cookie-session');
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
const methodOverride = require('method-override');

//

app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.use(cookieSession({
  name: 'session',
  keys: ["crimson", "racing"]
}));
app.set("view engine", "ejs")


//

const urlDatabase = {};

const users = {}

// ShortURL generator function
function generateRandomString() {
  return Math.random().toString(36).substring(2,8)
}

// GET routes under here

app.get("/", (req, res) => {
  res.redirect("/urls");  /// urls acts as a homepage
});



app.get("/register", (req, res) => {
  let templateVars = {
    urlDatabase: urlDatabase,
    users: users,
    username: req.session["user ID"]
  }
  res.render("register", {
    templateVars: templateVars
  });
});

app.get("/login", (req, res) => {
  let templateVars = {
    users: users,
    username: req.session["user ID"]}
  res.render("login", {
    templateVars: templateVars
  });
});

app.get("/urls", (req, res) => {
  let templateVars = {
    urlDatabase: urlDatabase,
    users: users,
    username: req.session["user ID"]
  };
  res.render("urls_index", {
    templateVars: templateVars
  });
});

app.get("/urls/new", (req, res) => {
  if (!(req.session["user ID"])) {
    res.redirect("/login");
  }
  let templateVars = {
    users: users,
    username: req.session["user ID"]
  };
  res.render("urls_new", {
    templateVars: templateVars
  });
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    users: users,
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]["longURL"],
    username: req.session["user ID"]
  };
  res.render("urls_show", {
    templateVars: templateVars,
    users: users
  });
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/u/:shortURL", (req, res) => {
  var shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL]["longURL"];
  res.redirect(longURL);
});

// POST routes under here

app.post("/register", (req, res) => {
  let pWord = req.body.password
  let userMail = req.body.email
  let userID = generateRandomString()
  const hashedPassword = bcrypt.hashSync(pWord, 10);

  for (var existing in users) {
    if (userMail === users[existing]["email"]) {
      res.send("E-mail already registered!");
    }
  }

  users[userID] = {
    id: userID,
    email: userMail,
    password: hashedPassword
  };

  req.session["user ID"] = users[userID]["id"];
  res.redirect("/urls");
  });

app.post("/urls/:shortURL/delete", (req, res) => {
  var shortURL = req.params.shortURL;
   if (urlDatabase[req.params.shortURL]["userID"] === req.session["user ID"]) {
    delete urlDatabase[req.params.shortURL];
  }
  res.redirect("/urls");
});

// app.post("/urls/:shortURL", (req, res) => {
//   var shortURL = req.params.shortURL;
//   urlDatabase[shortURL]["longURL"] = req.body.longURL;
//   res.redirect("/urls");
// });


// this replaces the commented out POST route above. Using method-override package
app.put("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL
  if (urlDatabase[shortURL]["userID"] === req.session["user ID"]) {
    urlDatabase[shortURL]["longURL"] = req.body.longURL
  }
  res.redirect("/urls");
})

app.post("/urls", (req, res) => {
  var longURL = req.body.longURL;
  var shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: longURL,
    userID: req.session["user ID"]
  };
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  let inputMail = req.body.email;
  let inputPWord = req.body.password;

  for (var existing in users) {
    if (users[existing]["email"] == inputMail) {
      if (bcrypt.compareSync(inputPWord, users[existing]["password"])) {     //// hash sync compare using bcrypt
        req.session["user ID"] = users[existing]["id"]
        return res.redirect("/urls");
      } else {
        return res.send("Wrong password!");
      }
    }
  }
  res.send("Your e-mail address is not registered");
});

app.post("/logout", (req, res) => {
  res.clearCookie("session");   //// session deleted
  res.redirect("/urls");      //// back to homepage
});

// server listening on PORT

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});