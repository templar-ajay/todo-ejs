const dotenv = require("dotenv");
const express = require("express");
const date = require(__dirname + "/date.js");
const _ = require("lodash");
const mongoose = require("mongoose");
mongoose.set({ strictQuery: true });

const app = express();
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

dotenv.config();

mongoose
  .connect(
    `mongodb+srv://ajay:${process.env.PASS}@cluster0.x1rvbqd.mongodb.net/TodoListAdvanced?retryWrites=true&w=majority`
  )
  .catch(console.error);

const itemSchema = new mongoose.Schema({
  name: String,
});
const Item = mongoose.model("Item", itemSchema);

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemSchema],
});
const List = new mongoose.model("List", listSchema);

// set initial data in database
(async () => {
  if (!(await Item.find().length)) {
    // check if any data is present in database if not then insert default data
    var item1 = new Item({ name: "Buy Food" });
    var item2 = new Item({ name: "Cook Food" });
    var item3 = new Item({ name: "Serve Food" });
    var item4 = new Item({ name: "Eat Food" });

    Item.insertMany([item1, item2, item3, item4], console.log);
  }
  if (!(await List.find().length)) {
    const list = new List({
      name: "To-Do",
      items: [item1, item2, item3, item4],
    });

    list.save(console.log);
  }
})();

// const itemsObj = { "To-Do": ["Buy Food", "Cook Food", "Eat Food"] };

app.get("/", (req, res) => {
  res.redirect("/To-Do");
  // console.log(itemsObj);
});

app.get("/:id", async function (req, res) {
  // console.log(itemsObj);

  ///////////////////////////////////

  let listName = req.params.id;
  console.log(listName);

  // const theList = await List.find({name:listName})
  // console.log("List", theList);
  // const listItems = await

  if (listName == "To-Do") {
    const day = date.getDate();
    res.render("todoList.ejs", {
      listTitle: day,
      listItems: itemsObj["To-Do"],
      lists: Lists(),
      route: "/post/To-Do",
    });
  } else {
    if (Lists().includes(listName)) {
      res.render("todoList.ejs", {
        listTitle: listName + " List",
        listItems: itemsObj[listName],
        lists: Lists(),
        route: "/post/" + listName,
      });
    } else res.redirect("/To-Do");
  }
});

app.post("/post/:id", function (req, res) {
  console.log(itemsObj);

  let path = req.params.id;
  console.log(path);
  const newItem = req.body.newItem;
  console.log("newItem", newItem);
  itemsObj[path].push(newItem);
  res.redirect("/" + path);
});

app.get("/about", (req, res) => {
  console.log(itemsObj);

  res.render("about.ejs");
});

app.post("/newListName", (req, res) => {
  console.log(itemsObj);

  const newList = req.body.newListName;
  itemsObj[newList] = [];

  console.log(Lists());
  console.log(itemsObj);
  res.redirect("/");
});

app.listen(3000, () => {
  console.log("app running at http://localhost:3000");
});

function Lists() {
  return Object.keys(itemsObj);
}
