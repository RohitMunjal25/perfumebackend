const Contact =
require("../models/Contact");

const createContact =
async(req,res)=>{

 try{

  const contact =
  await Contact.create(req.body);

  res.status(201).json({
   success:true,
   message:"Contact message submitted",
   contact
  });

 }catch(error){

  res.status(500).json({
   success:false,
   message:error.message
  });

 }

};

const getContacts =
async(req,res)=>{

 try{

  const contacts =
  await Contact.find()
  .sort({createdAt:-1});

  res.json({
   success:true,
   contacts
  });

 }catch(error){

  res.status(500).json({
   success:false,
   message:error.message
  });

 }

};

const deleteContact =
async(req,res)=>{

 try{

  const contact =
  await Contact.findByIdAndDelete(
   req.params.id
  );

  if(!contact){
   return res.status(404).json({
    success:false,
    message:"Contact message not found"
   });
  }

  res.json({
   success:true,
   message:"Contact message deleted"
  });

 }catch(error){

  res.status(500).json({
   success:false,
   message:error.message
  });

 }

};

module.exports = {
 createContact,
 getContacts,
 deleteContact
};
