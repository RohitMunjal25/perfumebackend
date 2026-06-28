const Order =
require("../models/Order");

const Coupon =
require("../models/Coupon");

const createOrder =
async(req,res)=>{

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

  const order =
  await Order.create(orderData);

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

const getMyOrders =
async(req,res)=>{

 try{

  const orders =
  await Order.find({userId:req.user.id})
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

const getOrders =
async(req,res)=>{

 try{

  const orders =
  await Order.find()
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

const getOrder =
async(req,res)=>{

 try{

  const order =
  await Order.findById(req.params.id)
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

const getMyOrder =
async(req,res)=>{

 try{

  const order =
  await Order.findOne({
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

const updateOrder =
async(req,res)=>{

 try{

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

  const order =
  await Order.findByIdAndUpdate(
   req.params.id,
   allowedUpdates,
   {
    new:true,
    runValidators:true
   }
  );

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

module.exports = {
 createOrder,
 getMyOrders,
 getMyOrder,
 getOrders,
 getOrder,
 updateOrder
};
