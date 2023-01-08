const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");

const lists = ["To-Do"];
// const listItemsArr = ;
const itemsObj = { "/": ["Buy Food", "Cook Food", "Eat Food"] };

const obj = {
  workItems: [],
  fag: [],
};

const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/newList", (req, res) => {
  console.log(req.body);

  res.redirect("/");
});

app.get("/", (req, res) => {
  const day = date.getDate();
  console.log("aya ki nahi aya", day);
  res.render("todoList.ejs", {
    listTitle: day,
    listItems: itemsObj["/"],
    lists: lists,
    route: "/",
  });
});

app.get("/:id", function (req, res) {
  let word = req.params.id;
  console.log(word);
  if (lists.includes(word)) {
    res.render("todoList.ejs", {
      listTitle: word + " List",
      listItems: itemsObj[word],
      lists: lists,
      route: "/post/" + word,
    });
  } else res.redirect("/");
});
app.post("/post/:id", function (req, res) {
  let path = req.params.id;
  console.log(path);
  const newItem = req.body.newItem;
  console.log("newItem", newItem);
  itemsObj[path].push(newItem);
  res.redirect("/" + path);
});

app.get("/about", (req, res) => {
  res.render("about.ejs");
});

app.post("/", (req, res) => {
  const newItem = req.body.newItem;
  if (req.body.button == "Work List") {
    workItems.push(newItem);
    res.redirect("/work");
  } else {
    itemsObj["/"].push(newItem);
    res.redirect("/");
  }
});

app.post("/newListItem", (req, res) => {
  const newList = req.body.newListName;
  lists.push(newList);
  itemsObj[newList] = [];
  console.log(lists);
  console.log(itemsObj);
  res.redirect("/");
});

app.listen(3000, () => {
  console.log("app running at http://localhost:3000");
});
