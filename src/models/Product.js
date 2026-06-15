const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({

  name:{
    type:String,
    required:true
  },

  brand:String,

  description:String,

  category:String,

  price:{
    type:Number,
    required:true
  },

  stock:{
    type:Number,
    default:0
  },

images:[
 {
   type:String
 }
],

  featured:{
    type:Boolean,
    default:false
  }

},{
  timestamps:true
});

module.exports =
mongoose.model(
  "Product",
  productSchema
);