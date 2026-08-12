const Order = require("../models/Order");
const User = require("../models/User");
const Product = require("../models/Product");

const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: "user" });
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();

    // Order status ke hisaab se filters
    const pendingOrders = await Order.countDocuments({ orderStatus: "pending" });
    const completedOrders = await Order.countDocuments({ orderStatus: "delivered" });
    const returnOrders = await Order.countDocuments({ orderStatus: { $in: ["cancelled", "returned"] } });

    const [sales] = await Order.aggregate([{ $match: { paymentStatus: "paid" } }, { $group: { _id: null, total: { $sum: { $ifNull: ["$finalAmount", "$totalAmount"] } } } }]);
    const totalSales = sales?.total || 0;

    const recentOrders = await Order.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      stats: {
        totalSales,
        totalOrders,
        pendingOrders,
        completedOrders,
        returnOrders,
        totalProducts,
        totalUsers
      },
      recentOrders
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getDashboardStats };
