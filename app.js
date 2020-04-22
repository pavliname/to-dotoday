const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname+"/date.js");
const dotenv = require('dotenv');
dotenv.config();

const app = express();

app.set('view engine', 'ejs');
app.set('trust proxy', true)
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://"+process.env.USERNAME+":"+process.env.PASSWORD+"@cluster0-lk22i.mongodb.net/todolistDB", {useNewUrlParser:true});

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

const deletesSchema = {
  name: String,
  datetime: String,
  ip: String
}

const Delete = mongoose.model("Delete", deletesSchema);

// const item1 = new Item ({
//   name:"Buy Food"
// });
//
// const item2 = new Item ({
//   name:"Cook Food"
// });
//
// const item3 = new Item ({
//   name:"Eat Food"
// });
//
 let defaultItems = [];
 let deletedItems=[];

app.get("/", function(req,res){
let day=date.getDate();
Item.find({}, function(err, foundItems){
  if (foundItems.length ===0 && defaultItems.length !==0){
    Item.insertMany(defaultItems, function(err){
      if (err){
        console.log(err);
      } else {
        console.log("Successfully saved default items to DB.");
      }
    });
    res.redirect("/");
  } else {
  res.render("list", {listTitle:day, newListItems:foundItems});
}
});

});

app.post("/", function(req, res){
  let itemName=req.body.newItem;

  const item = new Item({
    name: itemName
  });

  item.save();
  res.redirect("/");

});

app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  console.log(checkedItemId);
  let idNameArray = checkedItemId.split("|");

  Delete.create({name:idNameArray[1],datetime:new Date(),ip:req.headers['x-forwarded-for'] || req.connection.remoteAddress ||  req.socket.remoteAddress || req.connection.socket.remoteAddress}, function (err){
    if (err){
      console.log(err);
    } else {
      console.log("Record added to deletes.")
    }
  });

Item.findByIdAndRemove({_id:idNameArray[0]}, function(err){
  if (!err) {
      console.log("Successfully deleted item.");
      res.redirect("/");
    } else {
      console.log(err);
    }
 });
});

let port = process.env.PORT;
if (port ==null || port ==""){
  port = 3000;
}


app.listen(port, function(){
  console.log("Server has started successfully.");
});
