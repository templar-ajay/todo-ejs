require("dotenv").config();
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
const List = mongoose.model("List", listSchema);

(async () => {
  const itemsPresent = await Item.find({});
  console.log("itemsPresent", itemsPresent);
  if (!itemsPresent.length) {
    var item1 = new Item({ name: "Buy Food" });
    var item2 = new Item({ name: "Cook Food" });
    var item3 = new Item({ name: "Serve Food" });
    var item4 = new Item({ name: "Eat Food" });

    Item.insertMany([item1, item2, item3, item4], console.log);
  }

  const listPresent = await List.find({});
  console.log("listPresent", listPresent);
  if (!listPresent.length) {
    const list = new List({
      name: _.capitalize("To-do"),
      items: [item1, item2, item3, item4],
    });

    list.save(console.log);
  }
})();

app.get("/", (req, res) => {
  res.redirect("/To-do");
});

app.get("/:id", async function (req, res) {
  let listName = _.capitalize(req.params.id);
  console.log(listName);

  const lists = await List.find({});
  console.log("lists", lists);

  const theList = lists.filter((x) => x.name == listName)[0];
  if (theList != undefined) {
    console.log("theList", theList);
    const listItems = theList.items;
    console.log("listItems", listItems);

    if (listName == "To-do") {
      const day = date.getDate();
      res.render("todoList.ejs", {
        listTitle: day,
        listItems: listItems,
        lists: lists.map((x) => x.name),
        route: "/post/To-Do",
        listName: listName,
      });
    } else {
      res.render("todoList.ejs", {
        listTitle: listName + " List",
        listItems: listItems,
        lists: lists.map((x) => x.name),
        route: "/post/" + listName,
        listName: listName,
      });
    }
  } else {
    res.redirect("/To-do");
  }
});

app.post("/post/:id", async function (req, res) {
  let path = _.capitalize(req.params.id);
  console.log(path);

  const newItem = new Item({ name: req.body.newItem });
  console.log("newItem", newItem);

  List.updateOne({ name: path }, { $push: { items: newItem } }, console.log);

  res.redirect("/" + path);
});

app.get("/about", (req, res) => {
  console.log(itemsObj);

  res.render("about.ejs");
});

app.post("/newListName", (req, res) => {
  const newList = new List({
    name: _.capitalize(req.body.newListName),
    items: [],
  });
  newList.save();

  res.redirect("/");
});

app.post("/delete", async (req, res) => {
  console.log("delete Request REcieved");
  const id = req.body.checkbox;
  const listName = req.body.listName;

  console.log("listName", listName);
  console.log("listName", listName);

  List.findOneAndUpdate(
    { name: listName },
    { $pull: { items: { _id: id } } },
    (err, foundList) => {
      console.log("foundList", foundList);
      if (!err) res.redirect("/" + listName);
    }
  );
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`app running at http://localhost:${process.env.PORT || "3000"}`);
});
