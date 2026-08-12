const Newsletter = require("../models/Newsletter");
const { sendNewsletterWelcome } = require("../services/emailService");

const subscribeNewsletter = async(req, res) => {
 try {
  const isNew = await Newsletter.findOne({ email: req.body.email });
  
  const newsletter = await Newsletter.findOneAndUpdate(
   { email: req.body.email },
   { email: req.body.email },
   { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  // Agar pehli baar subscribe kiya hai toh email bhej do
  if(!isNew) {
    await sendNewsletterWelcome(req.body.email);
  }

  res.status(201).json({ success: true, message: "Newsletter subscribed", newsletter });
 } catch(error) {
  res.status(500).json({ success: false, message: error.message });
 }
};

const getNewsletterSubscribers = async(req, res) => {
 try {
  const subscribers = await Newsletter.find().sort({createdAt: -1});
  res.json({ success: true, subscribers });
 } catch(error) {
  res.status(500).json({ success: false, message: error.message });
 }
};

const deleteNewsletterSubscriber = async(req, res) => {
 try {
  await Newsletter.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: "Subscriber deleted" });
 } catch(error) {
  res.status(500).json({ success: false, message: error.message });
 }
};

module.exports = { subscribeNewsletter, getNewsletterSubscribers, deleteNewsletterSubscriber };