const buckets = new Map();

function rateLimiter(req, res, next) {
  // Password reset needs protection per account as well as per visitor.
  // Normal sign-up must never be blocked because another visitor shares the same IP.
  const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
  const key = req.user?.id || (email ? `email:${email}|ip:${req.ip}` : req.ip || "unknown");
  const now = Date.now();
  const item = buckets.get(key) || { count: 0, resetAt: now + 15 * 60 * 1000 };
  if (now > item.resetAt) { item.count = 0; item.resetAt = now + 15 * 60 * 1000; }
  item.count += 1;
  buckets.set(key, item);
  if (item.count > 3) return res.status(429).json({ success:false, message:"Too many requests. Please try again in 15 minutes." });
  next();
}

module.exports = rateLimiter;
