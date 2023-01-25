require("dotenv").config();
const express = require("express");
const date = require(__dirname + "/date.js");
const _ = require("lodash");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
// const { render } = require("ejs");
// const path = require("path");
// path.resolve("path", __dirname + "/path/");

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

// (async () => {
//   const itemsPresent = await Item.find({});
//   console.log("itemsPresent", itemsPresent);
//   if (!itemsPresent.length) {
//     var item1 = new Item({ name: "Buy Food" });
//     var item2 = new Item({ name: "Cook Food" });
//     var item3 = new Item({ name: "Serve Food" });
//     var item4 = new Item({ name: "Eat Food" });

//     Item.insertMany([item1, item2, item3, item4], console.log);
//   }

//   const listPresent = await List.find({});
//   console.log("listPresent", listPresent);
//   if (!listPresent.length) {
//     const list = new List({
//       name: _.capitalize("To-do"),
//       items: [item1, item2, item3, item4],
//     });

//     list.save(console.log);
//   }
// })();

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
});

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", (req, res) => {
  if (req.isAuthenticated()) {
    res.redirect("/ToDo");
  } else res.redirect("/register");
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

app.get("/app", function (req, res) {
  if (req.isAuthenticated()) {
    console.log("/app", req.user._id);
    res.redirect("app/To-do/");
  } else {
    res.redirect("/login");
  }
});

app.get("/app/:listName/", async function (req, res) {
  if (req.isAuthenticated()) {
    app.use(express.static(__dirname + "/public/"));
    // check if user is authenticated
    if (!req.isAuthenticated()) res.redirect("/login");

    let listName = _.capitalize(req.params.listName);
    console.log(listName);

    // let userName = req.params.username;

    let userID = req.user._id;
    console.log("req.user.id", userID);

    // if (!userID) {
    //   const theUser = await User.findOne({ username: userName });
    //   userID = theUser._id;
    //   console.log("got from database", userID);
    // }

    const data = await Data.findOne({ user_id: userID });
    console.log(data);

    const lists = data.lists;

    const theList = lists.filter((x) => x.name == listName)[0];
    if (theList != undefined) {
      console.log("theList", theList);
      const listItems = theList.items;
      console.log("listItems", listItems);

      if (listName == "To-do") {
        const day = date.getDate();
        res.render("todoList", {
          listTitle: day,
          listItems: listItems,
          lists: lists.map((x) => x.name),
          route: "app/post/To-do",
          listName: listName,
        });
      } else {
        res.render("todoList", {
          listTitle: listName + " List",
          listItems: listItems,
          lists: lists.map((x) => x.name),
          route: "app/post/" + listName,
          listName: listName,
        });
      }
    } else {
      res.redirect("/To-do");
    }
  } else {
    res.redirect("/login");
  }
});

app.post("/register", function (req, res) {
  const { username, password } = req.body;
  console.log("register request received ");
  User.register({ username: username }, password, function (err) {
    if (err) {
      console.log(err);
      res.send(err);
      // res.redirect("/register");
    } else {
      passport.authenticate("local")(req, res, function (err, user) {
        const theUser = req.user;
        console.log(req.user);

        const item1 = new Item({ name: "Welcome to To-Do List" });
        const item2 = new Item({
          name: "delete an item by ticking the checkbox",
        });
        const item3 = new Item({
          name: "add new item by clicking the add button",
        });

        // Item.insertMany([item1, item2, item3], console.log);

        const todo_list = new List({
          name: _.capitalize("To-do"),
          items: [item1, item2, item3],
        });

        // todo_list.save(console.log);

        const data = new Data({
          user_id: theUser._id,
          lists: [todo_list],
        });

        data.save((err, data) => {
          if (err) {
            console.log(err);
          } else {
            console.log(data);
            res.redirect("/app");
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
    } else {
      passport.authenticate("local")(req, res, function () {
        res.redirect("/app");
      });
    }
  });
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`app running at http://localhost:${process.env.PORT || "3000"}`);
});

//////////////////////////////////////////////////////////////////////////////////

/*
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
  console.log("delete Request Received");
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
*/
