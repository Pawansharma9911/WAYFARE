const Review = require("../models/review.js");
const Listing = require("../models/listing.js");

module.exports.createReview = async(req, res) => {
    let { id } = req.params;
   // let listing = await Listing.findById(id);
    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;
   // listing.reviews.push(newReview);
console.log(id);
    await newReview.save();
   // await listing.save();
    req.flash("success", "New review Created");
    //console.log("new review saved");
    res.send("good");
    //res.redirect(`/listings/${listing._id}`);
};

module.exports.destroyReview = async(req, res) => {
    let {id, reviewId} = req.params;  
    await Review.findByIdAndDelete(reviewId);
    await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    req.flash("success", "review deleted");
    res.redirect(`/listings/${id}`);
};