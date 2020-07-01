//jshint esversion:6
//require dotenv
require("dotenv").config();
const express=require("express");
const bodyParser=require("body-parser");
const ejs=require("ejs");
const mongoose=require("mongoose");
//MD5 hashing
// const md5=require("md5");
// //salting and hashing
// const bcrypt=require("bcrypt");
// //salt round
// const saltRounds=10;
const session =require("express-session");
const passport=require("passport");
const passportLocalMongoose=require("passport-local-mongoose");
const app=express();
// const encrypt=require("mongoose-encryption");


app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine","ejs");
//express-session
app.use(session({
  secret:"Our little secret.",
  resave: false,
  saveUninitialized: true,
}))

//using passport check out passport documentation
app.use(passport.initialize());
app.use(passport.session());
mongoose.connect("mongodb://localhost:27017/userDB",{ useNewUrlParser: true,
                                                      useUnifiedTopology:true});
mongoose.set("useCreateIndex",true);

const userSchema=new mongoose.Schema({
  email:String,
  password:String
});
//this plugin must be order in front of creating new model.
//read plugin in mongoose documentation.
// userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ["password"] });
//mongoose encrypt will encrypt when you call save and then it will decrypt when you call find.

//passportLocalMongoose package
userSchema.plugin(passportLocalMongoose);

//new mongoose model
const User=new mongoose.model("User",userSchema);

passport.use(User.createStrategy());

// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/",function(req,res){
  res.render("home");
});
app.get("/login",function(req,res){
  res.render("login");
})
app.get("/register",function(req,res){
  res.render("register");
});

app.get("/secrets",function(req,res){
if(req.isAuthenticated()){
  res.render("secrets");
}else{
  res.redirect("/login");
}
});
app.get("/logout",function(req,res){
  req.logout();
  res.redirect('/');
})
app.post("/register",function(req,res){
//   bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
//     const newUser=new User({
//       email:req.body.username,
//       password:hash
//     });
//     newUser.save(function(err){
//       if(err){
//         console.log(err);
//       }else{
//         res.render("secrets");
//       }
//     })
// });

User.register({username:req.body.username},req.body.password,function(err,user){
  if(err){
    console.log(err);
    res.redirect("/register");
  }else{
    passport.authenticate("local")(req,res,function(){
      res.redirect("/secrets");
    });
  }
});

})



app.post("/login",function(req,res){
  // const username=req.body.username;
  // const password=req.body.password;
  // User.findOne({email:username},function(err,foundUser){
  //   if(err){
  //     console.log("No User Found");
  //   }else{
  //     if(foundUser){
  //       bcrypt.compare(password, foundUser.password, function(err, result) {
  //     // result == true
  //     if(result===true){
  //     res.render("secret");
  //   }
  // });
  //     }
  //   }
  // })


  const user=new User({
    username:req.body.username,
    password:req.body.password
  });
//passport login
  req.login(user, function(err) {
    if (err){
      console.log(err);
    }else{
  passport.authenticate("local")(req,res,function(){
    res.redirect("/secrets");
  })
 }
  });
})

app.listen("3000",function(){
  console.log("server started ");
})
