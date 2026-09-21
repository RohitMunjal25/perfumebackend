const buckets = new Map();

function rateLimiter(req, res, next) {
  const key = req.user?.id || req.ip || "unknown";
  const now = Date.now();
  const item = buckets.get(key) || { count: 0, resetAt: now + 15 * 60 * 1000 };
  if (now > item.resetAt) { item.count = 0; item.resetAt = now + 15 * 60 * 1000; }
  item.count += 1;
  buckets.set(key, item);
  if (item.count > 3) return res.status(429).json({ success:false, message:"Too many requests. Please try again in 15 minutes." });
  next();
}

module.exports = rateLimiter;
