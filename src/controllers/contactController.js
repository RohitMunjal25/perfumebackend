const Contact = require("../models/Contact");
const { sendContactTicket } = require("../services/emailService");

const createContact = async(req, res) => {
 try {
  // 6 digit ticket generation
  const ticketNumber = Math.floor(100000 + Math.random() * 900000).toString();
  
  const contactData = { ...req.body, ticketNumber };
  const contact = await Contact.create(contactData);

  // Send Email
  if(req.body.email) {
    await sendContactTicket(req.body.email, ticketNumber);
  }

  res.status(201).json({
   success: true,
   message: "Contact message submitted",
   ticketNumber,
   contact
  });
 } catch(error) {
  res.status(500).json({ success: false, message: error.message });
 }
};

const getContacts = async(req, res) => {
 try {
  const contacts = await Contact.find().sort({createdAt: -1});
  res.json({ success: true, contacts });
 } catch(error) {
  res.status(500).json({ success: false, message: error.message });
 }
};

const deleteContact = async(req, res) => {
 try {
  const contact = await Contact.findByIdAndDelete(req.params.id);
  if(!contact) return res.status(404).json({ success: false, message: "Not found" });
  res.json({ success: true, message: "Deleted" });
 } catch(error) {
  res.status(500).json({ success: false, message: error.message });
 }
};

module.exports = { createContact, getContacts, deleteContact };