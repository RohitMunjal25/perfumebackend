const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({

  name:{
    type:String,
    required:true
  },

  brand:String,

  description:String,

  category:String,

  targetPages:[
    {
      type:String,
      enum:[
        "home",
        "categories",
        "collections"
      ]
    }
  ],

  homepageSections:[
    {
      type:String,
      trim:true
    }
  ],

  productImages:[
    {
      url:{
        type:String,
        required:true
      },
      angle:{
        type:String,
        default:""
      },
      alt:{
        type:String,
        default:""
      }
    }
  ],

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
