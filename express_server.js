const express = require("express");
const app = express();
// const cookieSession = require('cookie-session');
const PORT = 8080; // default port 8080
const cookieSession = require("cookie-session");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const methodOverride = require("method-override");

//

app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(
  cookieSession({
    name: "session",
    keys: ["crimson", "racing"]
  })
);
app.set("view engine", "ejs");

// Empty URL database and user storage object
// A fun stretch would be to store these in a text file using .fs writestreams and readstreams
// this way, I wouldn't lose user and URL data when I turn the server off

const urlDatabase = {};

const users = {};

// ShortURL generator function
function generateRandomString() {
  return Math.random()
    .toString(36)
    .substring(2, 8);
}

// GET routes under here

app.get("/", (req, res) => {
  if (!req.session["user ID"]) {
    return res.redirect("/login"); /// redirect user to login page if not logged in
  }
  res.redirect("/urls"); /// urls acts as a homepage
});

app.get("/register", (req, res) => {
  const templateVars = {
    urlDatabase: urlDatabase,
    username: req.session["user ID"] /// tepmlatevars is extracted here too, because headers partials uses it
  };
  res.render("register", {
    templateVars: templateVars
  });
});

app.get("/login", (req, res) => {
  const templateVars = {
    users: users,
    username: req.session["user ID"]
  };
  res.render("login", {
    templateVars: templateVars /// tepmlatevars is extracted here too, because headers partials uses it
  });
});

app.get("/urls", (req, res) => {
  if (!req.session["user ID"]) {
    res.redirect("/login"); /// redirect user to login page if not logged in
  }
  const templateVars = {
    urlDatabase: urlDatabase,
    users: users,
    username: req.session["user ID"] /// tepmlatevars is extracted here too, because headers partials uses it
  };
  res.render("urls_index", {
    templateVars: templateVars
  });
});

app.get("/urls/new", (req, res) => {
  if (!req.session["user ID"]) {
    res.redirect("/login");
  }
  const templateVars = {
    users: users,
    username: req.session["user ID"]
  };
  res.render("urls_new", {
    templateVars: templateVars
  });
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    /// send this data to be able to view user specific true URL &
    users: users, /// fill in forms with right placeholder texts.
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
  /// extract URL database under JSON format
  res.json(urlDatabase);
});

app.get("/u/:shortURL", (req, res) => {
  /// short URL redirect. Accessible to public not only to user
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL]["longURL"];
  res.redirect(longURL);
});

// POST routes under here

app.post("/register", (req, res) => {
  let pWord = req.body.password; /// read from form input
  let userMail = req.body.email;
  let userID = generateRandomString();
  const hashedPassword = bcrypt.hashSync(pWord, 10);

  for (var existing in users) {
    ///  check in user base to see if the e-mail already registered
    if (userMail === users[existing]["email"]) {
      res.send("E-mail already registered!"); /// throw error if true
    }
  }

  users[userID] = {
    /// create user and add it to user database object
    id: userID,
    email: userMail,
    password: hashedPassword
  };

  req.session["user ID"] = users[userID]["id"]; ///  cookie session created
  res.redirect("/urls");
});

app.post("/urls/:shortURL/delete", (req, res) => {
  /// deleting a saved short URL - long URL binding for given user
  const shortURL = req.params.shortURL;
  if (urlDatabase[req.params.shortURL]["userID"] === req.session["user ID"]) {
    delete urlDatabase[req.params.shortURL];
    /// using JS in-built delete command. I could use DELETE with method override package
  }
  res.redirect("/urls");
});

/// Using method-override package
app.put("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if (urlDatabase[shortURL]["userID"] === req.session["user ID"]) {
    /// updating long URL for a given short URL
    urlDatabase[shortURL]["longURL"] = req.body.longURL;
  }
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  var longURL = req.body.longURL; /// get the long URL
  var shortURL = generateRandomString(); /// generate a short URL
  urlDatabase[shortURL] = {
    /// bind them together in an object with appropiate user ID
    longURL: longURL,
    userID: req.session["user ID"]
  };
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const inputMail = req.body.email; /// get the form information for user e-mail and password
  const inputPWord = req.body.password;
  checkDatabase(inputMail, inputPWord);

  for (var existing in users) {
    //// check user database
    if (users[existing]["email"] === inputMail) {
      if (bcrypt.compareSync(inputPWord, users[existing]["password"])) {
        //// hash sync compare using bcrypt
        req.session["user ID"] = users[existing]["id"];
        return res.redirect("/urls");
      } else {
        return res.send("Wrong password!"); /// wrong password error page
      }
    }
  }
  res.send("Your e-mail address is not registered"); /// For when a user tries to login without registering
});

app.post("/logout", (req, res) => {
  res.clearCookie("session"); //// session deleted
  res.redirect("/urls"); //// back to homepage
});

// server listening on PORT

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
