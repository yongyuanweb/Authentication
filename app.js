//jshint esversion:6
const express=require("express");
const bodyParser=require("body-parser");
const ejs=require("ejs");
const mongoose=require("mongoose");
const app=express();
const encrypt=require("mongoose-encryption");

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine","ejs");
mongoose.connect("mongodb://localhost:27017/userDB",{ useNewUrlParser: true,
                                                      useUnifiedTopology:true});
const userSchema=new mongoose.Schema({
  email:String,
  password:String
});
const secret ="THISISOURLITTLESECRET";
//this plugin must be order in front of creating new model.
//read plugin in mongoose documentation.
userSchema.plugin(encrypt, { secret: secret, encryptedFields: ['password'] });
//mongoose encrypt will encrypt when you call save and then it will decrypt when you call find.
const User=new mongoose.model("User",userSchema);

app.get("/",function(req,res){
  res.render("home");
});
app.get("/login",function(req,res){
  res.render("login");
})
app.get("/register",function(req,res){
  res.render("register");
})

app.post("/register",function(req,res){
  const newUser=new User({
    email:req.body.username,
    password:req.body.password
  });
  newUser.save(function(err){
    if(err){
      console.log(err);
    }else{
      res.render("secrets");
    }
  })

})

app.post("/login",function(req,res){
  const username=req.body.username;
  const password=req.body.password;
  User.findOne({email:username},function(err,foundUser){
    if(err){
      console.log("No User Found");
    }else{
      if(foundUser){
        if(foundUser.password===password){
          res.render("secrets");
        }
      }
    }
  })
})

app.listen("3000",function(){
  console.log("server started ");
})
