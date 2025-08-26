const { string } = require("joi");
const  mongoose = require("mongoose");
const listingSchema = new mongoose.Schema({
    title:{
         type: String,
         required: true,
    },
    description: String,
    image:{
        url: String,
        filename: String,
    },
    price: Number,
    location: String,
    country: String,
    reviews: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Review",
        }
    ],
     owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
     },
     geometry: {
        type: {
            type: String,
            enum: ['Point'],
            //required: true
        },
        coordinates: {
            type: [Number],
           // required: true
        },
     },
     category: {
        type: String,
        enum: ["Trending", "Rooms", "Iconic Cities", "Mountains", "Castles", "Amazing Pools", "Camping", "Farms", "Arctic", "Domes","Beaches"],
     }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;

