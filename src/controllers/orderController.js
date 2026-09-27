const Order = require("../models/Order");
const Coupon = require("../models/Coupon");
const { couponUnavailableReason, calculateDiscount } = require("../services/couponService");
const User = require("../models/User");
const { sendOrderConfirmation, sendTrackingUpdate, sendOrderDelivered, sendOrderCancelled } = require("../services/emailService");

const createOrder = async(req,res)=>{
 try{
  const orderData = {
   ...req.body,
   userId:req.user && req.user.id
  };

  if(!orderData.userId){
   return res.status(400).json({
    success:false,
    message:"User is required"
   });
  }

  const amount = Number(orderData.totalAmount);
  if (!Number.isFinite(amount) || amount <= 0) return res.status(400).json({ success:false, message:"A valid order total is required" });
  orderData.totalAmount = amount;
  orderData.discountAmount = 0;
  orderData.finalAmount = amount;

  if (orderData.couponCode) {
   const now = new Date();
   const coupon = await Coupon.findOne({ code: String(orderData.couponCode).toUpperCase() });
   const unavailableReason = couponUnavailableReason(coupon, amount, orderData.userId, now);
   if (unavailableReason) return res.status(400).json({ success:false, message:unavailableReason });
   orderData.couponCode = coupon.code;
   orderData.discountAmount = calculateDiscount(coupon, amount);
   orderData.finalAmount = Math.max(0, amount - orderData.discountAmount);
   const claimedCoupon = await Coupon.findOneAndUpdate(
    { _id: coupon._id, startDate: { $lte: now }, usedBy: { $ne: orderData.userId }, $and: [{ $or: [{ endDate: null }, { endDate: { $gte: now } }] }, { $or: [{ usageLimit: null }, { $expr: { $lt: ["$usedCount", "$usageLimit"] } }] }] },
    { $inc: { usedCount: 1 }, $addToSet: { usedBy: orderData.userId } }, { new: true }
   );
   if (!claimedCoupon) return res.status(400).json({ success: false, message: "Coupon is invalid, expired, already used, or its usage limit has been reached" });
  }
  const order = await Order.create(orderData);

  // ---> NEW SMART ADDRESS LOGIC: Duplicate Check <---
  if (orderData.userId && orderData.shippingAddress) {
    const userDoc = await User.findById(orderData.userId);
    
    if (userDoc) {
      // Check if same address (matching address line and pincode) already exists
      const isDuplicate = userDoc.addresses.some((addr) => {
        return (
          addr.address?.trim().toLowerCase() === orderData.shippingAddress.address?.trim().toLowerCase() &&
          addr.pincode === orderData.shippingAddress.pincode
        );
      });

      // Agar duplicate nahi hai, tabhi push karo
      if (!isDuplicate) {
        await User.findByIdAndUpdate(
          orderData.userId,
          { $push: { addresses: orderData.shippingAddress } },
          { new: true }
        );
      }
    }
  }
  // ---> NEW ADDITION END <---

  const user =
  await User.findById(orderData.userId)
  .select("email");

  if(user && user.email){
   sendOrderConfirmation(user.email, order)
   .catch((error)=>{
    console.log(
     "Order confirmation email failed:",
     error.message
    );
   });
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
  .populate("userId","name email")
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
  .populate("userId","name email")
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

  if (originalOrder.trackingLink || originalOrder.courierName) {
   if (req.body.trackingLink !== undefined || req.body.courierName !== undefined) {
    return res.status(409).json({ success:false, message:"Shipment tracking is locked after it has been saved" });
   }
  }

  const allowedUpdates = {
   paymentStatus:req.body.paymentStatus,
   orderStatus:req.body.orderStatus,
   trackingLink:req.body.trackingLink,
   courierName:req.body.courierName,
   trackingEmbedSrc:req.body.trackingEmbedSrc,
   cancellationReason:req.body.cancellationReason
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

  // ---> NEW ADDITION: EMAIL TRACKING & DELIVERED LOGIC <---
  const email = originalOrder.userId.email;
  const shortOrderId = String(updatedOrder._id).slice(-8).toUpperCase();

  // Email Tracking Logic
  if(req.body.trackingLink && req.body.trackingLink !== originalOrder.trackingLink) {
     const courier = req.body.courierName || "Courier Partner";
     
     await sendTrackingUpdate(email, shortOrderId, updatedOrder.trackingLink, courier);
     
     // NOTE: Agar WhatsApp service add karni ho toh yahan uska function call kar dena
  }

  // Delivered Email Logic
  if(req.body.orderStatus === "delivered" && originalOrder.orderStatus !== "delivered") {
     await sendOrderDelivered(email, shortOrderId);
  }
  if(req.body.orderStatus === "cancelled" && originalOrder.orderStatus !== "cancelled") {
     await sendOrderCancelled(email, shortOrderId, updatedOrder.cancellationReason);
  }
  // ---> NEW ADDITION END <---

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
