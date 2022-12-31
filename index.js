const express = require("express");
const bodyParser = require("body-parser");

const listItemsArr = ["buy food", "cook food", "eat food"];
const options = { weekday: "long", month: "long", day: "numeric" };

const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  const day = new Date().toLocaleDateString("en-US", options);
  res.render("todoList.ejs", { day: day, listItems: listItemsArr });
});

app.post("/", (req, res) => {
  const newItem = req.body.newItem;
  listItemsArr.push(newItem);
  res.redirect("/");
});

app.listen(3000, () => {
  console.log("app running at http://localhost:3000");
});
