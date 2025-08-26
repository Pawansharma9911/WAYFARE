const express = require("express");
const router  = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const {isLoggedIn, isReviewAuthor, validateReview} = require("../middleware.js");

const reviewController = require("../Controllers/reviews.js");



// REVIEWS ROUTE
    // POST ROUTE
    router.post("/",isLoggedIn, wrapAsync(reviewController.createReview));
  
  
    // DELETE ROUTE
    router.delete("/:reviewId",isLoggedIn,isReviewAuthor, wrapAsync(reviewController.destroyReview));

    module.exports = router;
   
  