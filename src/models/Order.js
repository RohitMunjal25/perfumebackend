const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({

  userId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User",
    required:true
  },

  products:[
    {
      productId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Product"
      },

      name:String,

      image:String,

      price:Number,

      quantity:Number
    }
  ],

  totalAmount:{
    type:Number,
    required:true
  },

  paymentStatus:{
    type:String,
    enum:[
      "pending",
      "paid",
      "failed"
    ],
    default:"pending"
  },

  orderStatus:{
    type:String,
    enum:[
      "pending",
      "processing",
      "packed",
      "shipped",
      "delivered",
      "cancelled"
    ],
    default:"pending"
  },

  trackingLink:{
    type:String,
    default:""
  },

  shippingAddress:{
    fullName:String,
    phone:String,
    address:String,
    city:String,
    state:String,
    pincode:String
  },

  razorpayOrderId:String,

  razorpayPaymentId:String

},{
  timestamps:true
});

module.exports =
mongoose.model(
  "Order",
  orderSchema
);