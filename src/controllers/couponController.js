const Coupon =
require("../models/Coupon");

const createCoupon =
async(req,res)=>{

 try{

  const coupon =
  await Coupon.create(req.body);

  res.status(201).json({
   success:true,
   coupon
  });

 }catch(error){

  res.status(500).json({
   success:false,
   message:error.message
  });

 }

};

const getCoupons =
async(req,res)=>{

 try{

  const coupons =
  await Coupon.find()
  .sort({createdAt:-1});

  res.json({
   success:true,
   coupons
  });

 }catch(error){

  res.status(500).json({
   success:false,
   message:error.message
  });

 }

};

const updateCoupon =
async(req,res)=>{

 try{

  const coupon =
  await Coupon.findByIdAndUpdate(
   req.params.id,
   req.body,
   {
    new:true,
    runValidators:true
   }
  );

  if(!coupon){
   return res.status(404).json({
    success:false,
    message:"Coupon not found"
   });
  }

  res.json({
   success:true,
   coupon
  });

 }catch(error){

  res.status(500).json({
   success:false,
   message:error.message
  });

 }

};

const deleteCoupon =
async(req,res)=>{

 try{

  const coupon =
  await Coupon.findByIdAndDelete(
   req.params.id
  );

  if(!coupon){
   return res.status(404).json({
    success:false,
    message:"Coupon not found"
   });
  }

  res.json({
   success:true,
   message:"Coupon deleted"
  });

 }catch(error){

  res.status(500).json({
   success:false,
   message:error.message
  });

 }

};

const applyCoupon =
async(req,res)=>{

 try{

  const {
   code,
   orderAmount
  } = req.body;

  const coupon =
  await Coupon.findOne({
   code:String(code || "").toUpperCase(),
   isActive:true
  });

  if(!coupon){
   return res.status(404).json({
    success:false,
    message:"Invalid coupon code"
   });
  }

  const now = new Date();

  if(coupon.startDate && coupon.startDate > now){
   return res.status(400).json({
    success:false,
    message:"Coupon is not active yet"
   });
  }

  if(coupon.endDate && coupon.endDate < now){
   return res.status(400).json({
    success:false,
    message:"Coupon expired"
   });
  }

  if(orderAmount < coupon.minOrderAmount){
   return res.status(400).json({
    success:false,
    message:`Minimum order amount is ${coupon.minOrderAmount}`
   });
  }

  if(coupon.usageLimit && coupon.usedCount >= coupon.usageLimit){
   return res.status(400).json({
    success:false,
    message:"Coupon usage limit reached"
   });
  }

  let discountAmount =
  coupon.discountType === "percentage"
   ? (orderAmount * coupon.discountValue) / 100
   : coupon.discountValue;

  if(coupon.maxDiscount){
   discountAmount =
   Math.min(discountAmount,coupon.maxDiscount);
  }

  discountAmount =
  Math.min(discountAmount,orderAmount);

  res.json({
   success:true,
   coupon,
   discountAmount,
   finalAmount:orderAmount - discountAmount
  });

 }catch(error){

  res.status(500).json({
   success:false,
   message:error.message
  });

 }

};

module.exports = {
 createCoupon,
 getCoupons,
 updateCoupon,
 deleteCoupon,
 applyCoupon
};
