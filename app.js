const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://princania:prem7488@cluster0.v3x8c.mongodb.net/todolistDB");

const schema = { name: String };
const recordSchema = { name: String, items: [schema] };

const List = mongoose.model("List", schema);
const Record = mongoose.model("Record", recordSchema);

const item1 = new List({ name: "Welcome" });
const item2 = new List({ name: "Hit the + button" });
const item3 = new List({ name: "Thank you" });

const defaultItems = [item1, item2, item3];

const workItems = [];

app.get("/", function (req, res) {

  List.find({}, function (err, foundItems) {

    if (foundItems.length == 0) {
      List.insertMany(defaultItems, function (err) {
        if (err) {
          console.log(err);
        }
        else {
          console.log("Successfully added");
        }
      })
      res.redirect("/");
    }
    else {
      console.log(foundItems);
      res.render("list", { listTitle: "Today", newListItems: foundItems });
    }

  })
});

app.post("/delete", function (req, res) {

  const id = req.body.checkbox;
  const listName = req.body.listName;
  if(listName == "Today")
  {
    List.findByIdAndRemove(id, function (err) {
      if (err) {
        console.log(err);
      }
      else {
        console.log("Succefully deleted");
        res.redirect("/");
      }
    });
  }
  else
  {
    Record.findOneAndUpdate({name: listName}, {$pull: {items: {_id: id}}}, function(err, foundRecord){
      if(!err)
      {
        res.redirect("/"+listName);
      }
    })
  }
  

});

app.post("/", function (req, res) {

  const item = req.body.newItem;
  const title = req.body.list;
  const newItem = new List({ name: item });

  if(title == "Today")
  {
    newItem.save();
  res.redirect("/");
  }
  else
  {
    Record.findOne({name: title}, function(err, foundList){
      foundList.items.push(newItem);
      foundList.save();
      res.redirect("/"+ title);
    })
  }
});

app.get("/:custom", function (req, res) {
  const customName = _.capitalize(req.params.custom);

  Record.findOne({ name: customName }, function (err, results) {
    if (!err) {
      if (!results) {
        console.log("Does not exist");

          const record = new Record({
          name: customName,
          items: defaultItems
        });
        record.save();
        res.redirect("/"+ customName);
      }
      else {
        console.log("exists");
        res.render("list", { listTitle: results.name, newListItems: results.items });
      }
    }

  })

});

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
