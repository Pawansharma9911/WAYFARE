const express = require("express");
const router  = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError");
const {listingSchema} = require("../schema.js");
const Listing = require("../models/listing.js");
const {isLoggedIn, isOwner, validateListing} = require("../middleware.js");

const listingController = require("../Controllers/listings.js");

const multer  = require('multer');
const {storage} = require("../cloudConfig.js");
//const upload = multer({ dest: 'uploads/' })        // this is by default
const upload = multer({ storage });


router
.route("/")
.get(wrapAsync(listingController.index))
.post(upload.single("listing[image]"), wrapAsync(listingController.createListing));



// // Index Route
// router.get("/",  wrapAsync(listingController.index));

// NEW ROUTE
router.get("/new", isLoggedIn, listingController.renderNewForm);


// // CREATE ROUTE
 router.post("/",validateListing, wrapAsync(listingController.createListing)); 


// SHOW ROUTE
router.get("/:id",  wrapAsync(listingController.showListing));


// EDIT ROUTE
router.get("/:id/edit",isLoggedIn,isOwner,  wrapAsync(listingController.editListing));
  

//UPDATE ROUTE
router.put("/:id",isLoggedIn,upload.single("listing[image]"),   wrapAsync(listingController.updateListing));


// DELETE ROUTE
router.delete("/:id",isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));

module.exports = router;