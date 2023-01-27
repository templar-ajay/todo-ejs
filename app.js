// make a video on youtube, about how to make a todo list app using ejs and express

require("dotenv").config();
const express = require("express");
const date = require(__dirname + "/date.js");
const _ = require("lodash");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
mongoose.set("strictQuery", false);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

mongoose
  .connect(
    `mongodb+srv://ajay:${process.env.PASS}@cluster0.x1rvbqd.mongodb.net/ToDoListForAll?retryWrites=true&w=majority`
  )
  .catch(console.error);

const itemSchema = new mongoose.Schema({
  name: String,
});
const Item = mongoose.model("Item", itemSchema);
const item1 = new Item({ name: "Welcome to To-Do List" });
const item2 = new Item({
  name: "create a new list by tapping the + icon on the right of To-do ⬆️",
});
const item3 = new Item({
  name: "to delete the current list tap on the list Name, a delete icon will magically appear 🪄",
});
const item4 = new Item({
  name: "add new item by clicking the + button below ↘️",
});
const item5 = new Item({
  name: "delete an item by ticking the checkbox",
});
const item6 = new Item({
  name: "Happy Hunting 🔱",
});

Item.insertMany([item1, item2, item3, item4, item5, item6], (err, results) => {
  if (err) console.log(err);
});

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemSchema],
});
const List = mongoose.model("List", listSchema);

const dataSchema = new mongoose.Schema({
  username: String,
  lists: [listSchema],
});

const Data = mongoose.model("Data", dataSchema);

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
});

userSchema.plugin(passportLocalMongoose, {
  IncorrectPasswordError: "'Password or username are incorrect'",
});

const User = mongoose.model("User", userSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", (req, res) => {
  if (req.isAuthenticated()) {
    res.redirect("/ToDo");
  } else res.redirect("/login");
});

app.get("/register", (req, res) => {
  res.render("login-register", {
    showRegister: true,
  });
});

app.get("/login", (req, res) => {
  res.render("login-register", {
    showRegister: false,
  });
});

app.get("/logout", function (req, res) {
  req.logOut(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

app.get("/about", (req, res) => {
  res.render("about.ejs");
});

app.get("/:listName", async function (req, res) {
  if (req.isAuthenticated()) {
    let listName = _.capitalize(req.params.listName);
    // console.log(listName);

    // console.log("req.user", req.user);
    const { username } = req.user;
    // console.log("req.user.username", username);

    const data = await Data.findOne({ username: username });
    // console.log("data", data);

    const lists = data.lists;

    const theList = lists.filter((x) => x.name == listName)[0];
    if (theList != undefined) {
      // console.log("theList", theList);
      const listItems = theList.items;
      // console.log("listItems", listItems);

      res.render("todoList", {
        listTitle: listName == "To-do" ? date.getDate() : `${listName} List`,
        lists: lists.map((x) => x.name),
        listItems: listItems,
        listName: listName,
      });
    } else {
      res.redirect("/To-do");
    }
  } else {
    res.redirect("/login");
  }
});

app.post("/register", function (req, res) {
  const { username, password } = req.body;
  // console.log("register request received ");
  User.register({ username: username }, password, function (err) {
    if (err) {
      console.log(err);
      res.send(err);
      // res.redirect("/register");
    } else {
      passport.authenticate("local")(req, res, function (err, user) {
        const theUser = req.user;
        // console.log(req.user);

        const todo_list = new List({
          name: _.capitalize("To-do"),
          items: [item1, item2, item3, item4, item5, item6],
        });

        todo_list.save((err) => {
          if (err) console.log(err);
        });

        const data = new Data({
          username: theUser.username,
          lists: [todo_list],
        });

        data.save((err, data) => {
          if (err) {
            console.log(err);
          } else {
            // console.log(data);
            res.redirect("/To-do");
          }
        });
      });
    }
  });
});

app.post("/login", function (req, res) {
  const { username, password } = req.body;
  const user = new User({
    username: username,
    password: password,
  });

  req.login(user, function (err) {
    if (err) {
      console.log(err);
      res.redirect("/register");
      return next(err);
    } else {
      passport.authenticate("local")(req, res, function () {
        res.redirect("/To-do");
      });
    }
  });
  // res.redirect("/To-do");
});

app.post("/delete", async (req, res) => {
  // console.log("delete Request Received");
  const { checkbox: checkboxID, listName } = req.body;
  const { username } = req.user;
  const itemId = mongoose.Types.ObjectId(checkboxID);

  Data.findOneAndUpdate(
    {
      username: username,
    },
    { $pull: { "lists.$[].items": { _id: itemId } } },
    (err, foundList) => {
      console.log(err, foundList);
      if (!err) {
        res.redirect("/" + listName);
      } else {
        console.log(err);
        res.send(
          "some error occurred while deleting the item, please try restarting the app. If the error persists, email the developer at templar.command0@gmail.com"
        );
      }
    }
  );
});

app.post("/addNewList", (req, res) => {
  console.log("add new user request received");
  if (req.isAuthenticated()) {
    const { username } = req.user;
    const { newListName } = req.body;
    const newList = new List({
      name: _.capitalize(req.body.newListName),
      items: [],
    });
    // newList.save();

    Data.updateOne(
      {
        username: username,
      },
      { $push: { lists: newList } },
      (err, result) => {
        console.log(err);
        if (!err) {
          console.log(newList, "added for user", username);
          res.redirect("/To-do");
        }
      }
    );
  } else {
    res.redirect("/login");
  }
});

app.post("/deleteList", (req, res) => {
  const { username } = req.user;
  const { listName } = req.body;
  if (req.isAuthenticated()) {
    //
    Data.findOneAndUpdate(
      {
        username: username,
      },
      { $pull: { lists: { name: listName } } },
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          res.redirect("/");
        }
      }
    );
  } else {
    res.redirect("/login");
  }
});

app.post("/:listName", async function (req, res) {
  if (req.isAuthenticated()) {
    const { username } = req.user;
    let listName = _.capitalize(req.params.listName);
    // console.log(listName);
    const { newItem } = req.body;
    const item = new Item({ name: newItem });
    item.save();

    // console.log("newItem", item);

    Data.updateOne(
      {
        username: username,
        "lists.name": listName,
      },
      { $push: { "lists.$.items": item } },
      (err, result) => {
        if (!err) {
          res.redirect("/" + listName);
        } else {
          console.log("err while adding list item", err);
          res.send(
            "some error occurred while adding the item, please try restarting the app. If the error persists, email the developer at templar.command0@gmail.com"
          );
        }
      }
    );
  } else {
    res.redirect("/login");
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`app running at http://localhost:${process.env.PORT || "3000"}`);
});
