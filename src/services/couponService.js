const Order = require("../models/Order");

const couponUnavailableReason = async (coupon, amount, userId, userEmail, now = new Date()) => {
  if (!coupon) return "Invalid coupon code";
  if (coupon.startDate && coupon.startDate > now) return "Coupon is not active yet";
  if (coupon.endDate && coupon.endDate < now) return "Coupon expired";
  if (!Number.isFinite(amount) || amount <= 0) return "A valid order amount is required";
  if (amount < Number(coupon.minOrderAmount || 0)) return `Minimum order amount is ${coupon.minOrderAmount}`;
  if (coupon.usageLimit !== null && coupon.usageLimit !== undefined && coupon.usedCount >= coupon.usageLimit) return "Coupon usage limit reached";
  if (userId && (coupon.usedBy || []).some((id) => String(id) === String(userId))) return "You have already used this coupon";
  if (coupon.eligibility === "new_users") {
    const previousOrder = await Order.exists({ userId, orderStatus: { $nin: ["cancelled", "returned"] } });
    if (previousOrder) return "This coupon is for new customers only";
  }
  if (coupon.eligibility === "selected_users") {
    const allowedEmails = (coupon.eligibleEmails || []).map((email) => String(email).toLowerCase());
    if (!userEmail || !allowedEmails.includes(String(userEmail).toLowerCase())) return "This coupon is not available for this account";
  }
  return null;
};

const calculateDiscount = (coupon, amount) => {
  const configuredValue = Number(coupon.discountValue);
  const rawDiscount = coupon.discountType === "percentage" ? (amount * configuredValue) / 100 : configuredValue;
  const cappedDiscount = coupon.maxDiscount === null || coupon.maxDiscount === undefined ? rawDiscount : Math.min(rawDiscount, Number(coupon.maxDiscount));
  return Math.max(0, Math.min(Math.round(cappedDiscount * 100) / 100, amount));
};

module.exports = { couponUnavailableReason, calculateDiscount };
