const mongoose = require("mongoose");

const couponSchema =
new mongoose.Schema({

  code:{
    type:String,
    required:true,
    unique:true,
    uppercase:true,
    trim:true
  },

  discountType:{
    type:String,
    enum:[
      "percentage",
      "fixed"
    ],
    default:"percentage"
  },

  discountValue:{
    type:Number,
    required:true,
    min:0
  },

  minOrderAmount:{
    type:Number,
    default:0
  },

  maxDiscount:{
    type:Number,
    default:null
  },

  startDate:{
    type:Date,
    default:Date.now
  },

  endDate:{
    type:Date,
    default:null
  },

  usageLimit:{
    type:Number,
    default:null
  },

  usedCount:{
    type:Number,
    default:0
  },

  usedBy:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User"
  }],

  isActive:{
    type:Boolean,
    default:true
  }

},{
  timestamps:true
});

module.exports =
mongoose.model(
  "Coupon",
  couponSchema
);
