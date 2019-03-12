var express = require("express");
var app = express();
var PORT = 8080; // default port 8080

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

function urlParser(input){
  var parsed = JSON.parse(input)
  return parsed
}

app.set("view engine", "ejs")

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  var templateVars = urlDatabase
  // [
  // {short: Object.keys(urlDatabase)[0], long: Object.values(urlDatabase)[0]},
  // {short: Object.keys(urlDatabase)[1], long: Object.values(urlDatabase)[1]}
  // ]
  res.render("urls_index", {
    templateVars: templateVars
  });
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});