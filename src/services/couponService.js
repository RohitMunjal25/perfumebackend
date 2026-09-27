const couponUnavailableReason = (coupon, amount, userId, now = new Date()) => {
  if (!coupon) return "Invalid coupon code";
  if (coupon.startDate && coupon.startDate > now) return "Coupon is not active yet";
  if (coupon.endDate && coupon.endDate < now) return "Coupon expired";
  if (!Number.isFinite(amount) || amount <= 0) return "A valid order amount is required";
  if (amount < Number(coupon.minOrderAmount || 0)) return `Minimum order amount is ${coupon.minOrderAmount}`;
  if (coupon.usageLimit !== null && coupon.usageLimit !== undefined && coupon.usedCount >= coupon.usageLimit) return "Coupon usage limit reached";
  if (userId && (coupon.usedBy || []).some((id) => String(id) === String(userId))) return "You have already used this coupon";
  return null;
};

const calculateDiscount = (coupon, amount) => {
  const configuredValue = Number(coupon.discountValue);
  const rawDiscount = coupon.discountType === "percentage" ? (amount * configuredValue) / 100 : configuredValue;
  const cappedDiscount = coupon.maxDiscount === null || coupon.maxDiscount === undefined ? rawDiscount : Math.min(rawDiscount, Number(coupon.maxDiscount));
  return Math.max(0, Math.min(Math.round(cappedDiscount * 100) / 100, amount));
};

module.exports = { couponUnavailableReason, calculateDiscount };
