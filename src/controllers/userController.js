const User = require("../models/User");
const Order = require("../models/Order");

// GET USER PROFILE & ORDER HISTORY
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const orders = await Order.find({ userId: req.user.id })
      .populate("products.productId")
      .sort({ createdAt: -1 });

    res.json({ success: true, user, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateName = async (req, res) => {
  try {
    const name = String(req.body.name || "").trim();
    if (!name) return res.status(400).json({ success: false, message: "Name is required" });
    const user = await User.findByIdAndUpdate(req.user.id, { name }, { new: true, runValidators: true }).select("-password");
    res.json({ success: true, message: "Name updated", user });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

// ADD NEW ADDRESS
const addAddress = async (req, res) => {
  try {
    const newAddress = req.body; 

    // $push operator existing array me naya address daal dega
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $push: { addresses: newAddress } },
      { new: true, runValidators: true }
    ).select("-password");

    res.json({ success: true, message: "Address added successfully", user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE SPECIFIC ADDRESS
const deleteAddress = async (req, res) => {
  try {
    const { addressId } = req.params;

    // $pull operator us specific _id wale address ko array se nikal dega
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $pull: { addresses: { _id: addressId } } },
      { new: true }
    ).select("-password");

    res.json({ success: true, message: "Address deleted successfully", user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateAddress = async (req, res) => {
  try {
    const allowedFields = ["fullName", "phone", "address", "city", "state", "pincode"];
    const changes = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowedFields.includes(key)).map(([key, value]) => [`addresses.$.${key}`, value]));
    if (!Object.keys(changes).length) return res.status(400).json({ success: false, message: "No valid address fields provided" });
    const user = await User.findOneAndUpdate(
      { _id: req.user.id, "addresses._id": req.params.addressId },
      { $set: changes },
      { new: true, runValidators: true }
    ).select("-password");
    if (!user) return res.status(404).json({ success: false, message: "Address not found" });
    res.json({ success: true, message: "Address updated", user });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

module.exports = {
  getUserProfile,
  updateName,
  addAddress,
  updateAddress,
  deleteAddress
};
