const Order = require("../models/Order");
const Coupon = require("../models/Coupon");
const { sendTrackingUpdate } = require("../services/emailService");

const createOrder = async(req,res)=>{
 try{
  const orderData = {
   ...req.body,
   userId:req.body.userId || (req.user && req.user.id)
  };

  if(!orderData.userId){
   return res.status(400).json({
    success:false,
    message:"User is required"
   });
  }

  if(!orderData.finalAmount){
   orderData.finalAmount =
   orderData.totalAmount - (orderData.discountAmount || 0);
  }

  const order = await Order.create(orderData);

  if(order.couponCode){
   await Coupon.findOneAndUpdate(
    {code:order.couponCode.toUpperCase()},
    {$inc:{usedCount:1}}
   );
  }

  res.status(201).json({
   success:true,
   order
  });

 }catch(error){
  res.status(500).json({
   success:false,
   message:error.message
  });
 }
};

const getMyOrders = async(req,res)=>{
 try{
  const orders = await Order.find({userId:req.user.id})
  .populate("products.productId")
  .sort({createdAt:-1});

  res.json({
   success:true,
   orders
  });

 }catch(error){
  res.status(500).json({
   success:false,
   message:error.message
  });
 }
};

const getOrders = async(req,res)=>{
 try{
  const orders = await Order.find()
  .populate("userId","name email mobile")
  .populate("products.productId")
  .sort({createdAt:-1});

  res.json({
   success:true,
   orders
  });

 }catch(error){
  res.status(500).json({
   success:false,
   message:error.message
  });
 }
};

const getOrder = async(req,res)=>{
 try{
  const order = await Order.findById(req.params.id)
  .populate("userId","name email mobile")
  .populate("products.productId");

  if(!order){
   return res.status(404).json({
    success:false,
    message:"Order not found"
   });
  }

  res.json({
   success:true,
   order
  });

 }catch(error){
  res.status(500).json({
   success:false,
   message:error.message
  });
 }
};

const getMyOrder = async(req,res)=>{
 try{
  const order = await Order.findOne({
   _id:req.params.id,
   userId:req.user.id
  }).populate("products.productId");

  if(!order){
   return res.status(404).json({
    success:false,
    message:"Order not found"
   });
  }

  res.json({
   success:true,
   order
  });

 }catch(error){
  res.status(500).json({
   success:false,
   message:error.message
  });
 }
};

const updateOrder = async(req,res)=>{
 try{
  const orderId = req.params.id;
  const originalOrder = await Order.findById(orderId).populate("userId");

  if(!originalOrder){
   return res.status(404).json({
    success:false,
    message:"Order not found"
   });
  }

  const allowedUpdates = {
   paymentStatus:req.body.paymentStatus,
   orderStatus:req.body.orderStatus,
   trackingLink:req.body.trackingLink,
   trackingEmbedSrc:req.body.trackingEmbedSrc
  };

  Object.keys(allowedUpdates).forEach((key)=>{
   if(allowedUpdates[key] === undefined){
    delete allowedUpdates[key];
   }
  });

  const updatedOrder = await Order.findByIdAndUpdate(
   orderId,
   allowedUpdates,
   {
    new:true,
    runValidators:true
   }
  ).populate("userId");

  // Email Tracking Logic
  if(req.body.trackingLink && req.body.trackingLink !== originalOrder.trackingLink) {
     const email = originalOrder.userId.email;
     const courier = req.body.courierName || "Courier Partner";
     
     await sendTrackingUpdate(email, updatedOrder._id, updatedOrder.trackingLink, courier);
     
     // NOTE: Agar WhatsApp service add karni ho toh yahan uska function call kar dena
  }

  res.json({
   success:true,
   order: updatedOrder
  });

 }catch(error){
  res.status(500).json({
   success:false,
   message:error.message
  });
 }
};

module.exports = {
 createOrder,
 getMyOrders,
 getMyOrder,
 getOrders,
 getOrder,
 updateOrder
};