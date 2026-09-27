const mongoose = require("mongoose");

const flashOfferSchema = new mongoose.Schema({
 text: { type:String, required:true, trim:true, maxlength:500 },
 isActive: { type:Boolean, default:false }
}, { timestamps:true });

module.exports = mongoose.model("FlashOffer", flashOfferSchema);
