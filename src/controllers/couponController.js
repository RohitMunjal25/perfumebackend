const Coupon =
require("../models/Coupon");
const { couponUnavailableReason, calculateDiscount } = require("../services/couponService");

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

const getAvailableCoupons = async (req, res) => {
 try {
  const amount = Number(req.query.subtotal ?? 0);
  const now = new Date();
  const coupons = await Coupon.find({
   isActive: true,
   startDate: { $lte: now },
   $or: [{ endDate: null }, { endDate: { $gte: now } }]
  }).sort({ createdAt: -1 });
  const eligibleCoupons = coupons.filter((coupon) => !couponUnavailableReason(coupon, amount, req.user.id, now));
  res.json({ success: true, coupons: eligibleCoupons.map((coupon) => ({
   _id: coupon._id,
   code: coupon.code,
   discountType: coupon.discountType,
   discountValue: coupon.discountValue,
   minOrderAmount: coupon.minOrderAmount,
   maxDiscount: coupon.maxDiscount,
   endDate: coupon.endDate
  })) });
 } catch (error) {
  res.status(500).json({ success:false, message:error.message });
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
   orderAmount,
   subtotal
  } = req.body;

  const amount = Number(orderAmount ?? subtotal ?? 0);

  const coupon = await Coupon.findOne({
   code:String(code || "").toUpperCase(),
   isActive:true
  });

  const now = new Date();
  const unavailableReason = couponUnavailableReason(coupon, amount, req.user.id, now);
  if (unavailableReason) return res.status(400).json({ success:false, message:unavailableReason });
  const discountAmount = calculateDiscount(coupon, amount);

  res.json({
   success:true,
   coupon,
   discountAmount,
   discount:discountAmount,
   finalAmount:amount - discountAmount,
   message:"Coupon applied successfully"
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
 getAvailableCoupons,
 updateCoupon,
 deleteCoupon,
 applyCoupon
};
