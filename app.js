if(process.env.NODE_ENV != "production"){
    require('dotenv').config();
}
//console.log(process.env.SECRET);

const express = require('express');
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const Listing = require("./models/listing.js");
const Review = require("./models/review.js");
const User = require("./models/user.js");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError");
const {listingSchema} = require("./schema.js");     // for validating
const {reviewSchema} = require("./schema.js");     // for validating
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const MongoStore = require('connect-mongo');


const listingsRouter = require("./routes/listing.js");
const userRouter = require("./routes/user.js");
//const reviewRouter = require("./routes/review.js");

 const dbUrl = process.env.ATLASDB_URL;
// ATLASDB_URL="mongodb+srv://ps4077881:58JM2xNb2AaENJhD@cluster0.zf0s1o5.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"


const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const { isLoggedIn, isReviewAuthor, validateReview } = require('./middleware.js');
const { wrap } = require('module');
//const { nextTick } = require('process');

app.listen(8080, () => {
    console.log("server is listening to port 8080");
});

app.set("view engine", "ejs");
app.set("views", path.join(__dirname,"views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SECRET
  },
  touchAfter: 24 * 3600,
});

store.on("error", () => {
  console.log("ERROR IN MONGO SESSION STORE", err);
});
const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7*24*60*60*1000,
        maxAge: 7*24*60*60*1000,
        httpOnly: true,
    }
};



app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});
  async function main() {

 await mongoose.connect(dbUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("Connected to MongoDB Atlas"))
.catch(err => console.error(" MongoDB connection error:", err));

}

// app.get("/demouser", wrapAsync(async(req, res) => {
//     let fakeUser = new User({
//         email: "ps@gmail.com",
//         username: "pawan",
//     });
//     let registeredUser = await User.register(fakeUser, "helloworld");
//     res.send(registeredUser);
// })
// );



app.get("/listings/:name/filters", wrapAsync(async(req, res) => {
  let {name} = req.params;
  const Listings = await Listing.find({category: name});
  console.log(Listings);
  res.render("listings/index2.ejs", {Listings});
}));

app.post("/listings/search", wrapAsync(async(req, res) => {
  let {category} = req.body;
 //console.log(req.body);
 const Listings = await Listing.find({category: category});
//   console.log(Listings);
   res.render("listings/index2.ejs", {Listings});
 

}))
app.use("/listings", listingsRouter);
app.use("/", userRouter);
// app.delete("/:id", wrapAsync(async(req, res) => {
//   let {id} = req.params;
//   console.log("good");
//   let deletedListing = await Listing.findByIdAndDelete(id);
//   res.redirect("/listings");
// }));


app.post("/listings/:id/reviews",isLoggedIn, wrapAsync(async(req, res) => {
  let { id } = req.params;
  let listing = await Listing.findById(id);
  let newReview = new Review(req.body.review);
  newReview.author = req.user._id;
  listing.reviews.push(newReview);
//console.log(id);
  await newReview.save();
  await listing.save();
  req.flash("success", "New review Created");
  //console.log("new review saved");
  //res.send("good");
  res.redirect(`/listings/${listing._id}`);
}));

app.delete("/listings/:id/reviews/:reviewId",isLoggedIn,isReviewAuthor, wrapAsync(async(req, res) => {
  let {id, reviewId} = req.params;  
  await Review.findByIdAndDelete(reviewId);
  await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
  req.flash("success", "review deleted");
 // res.send("good");
  res.redirect(`/listings/${id}`);
}));
  




  app.all("*", (req, res, next) => {
    next(new ExpressError(404, "page not found"));
  });


app.use((errr, req, res, next) => {          // error handler
   let{status = 500, message = "something went wrong"} = errr;
   res.render("error.ejs", {message});
});



main().then(() => {
    console.log("connected to db");
})
.catch(err => console.log(err));




