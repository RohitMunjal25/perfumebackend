const Newsletter =
require("../models/Newsletter");

const subscribeNewsletter =
async(req,res)=>{

 try{

  const newsletter =
  await Newsletter.findOneAndUpdate(
   {email:req.body.email},
   {email:req.body.email},
   {
    upsert:true,
    new:true,
    runValidators:true,
    setDefaultsOnInsert:true
   }
  );

  res.status(201).json({
   success:true,
   message:"Newsletter subscribed",
   newsletter
  });

 }catch(error){

  res.status(500).json({
   success:false,
   message:error.message
  });

 }

};

const getNewsletterSubscribers =
async(req,res)=>{

 try{

  const subscribers =
  await Newsletter.find()
  .sort({createdAt:-1});

  res.json({
   success:true,
   subscribers
  });

 }catch(error){

  res.status(500).json({
   success:false,
   message:error.message
  });

 }

};

const deleteNewsletterSubscriber =
async(req,res)=>{

 try{

  const subscriber =
  await Newsletter.findByIdAndDelete(
   req.params.id
  );

  if(!subscriber){
   return res.status(404).json({
    success:false,
    message:"Newsletter subscriber not found"
   });
  }

  res.json({
   success:true,
   message:"Newsletter subscriber deleted"
  });

 }catch(error){

  res.status(500).json({
   success:false,
   message:error.message
  });

 }

};

module.exports = {
 subscribeNewsletter,
 getNewsletterSubscribers,
 deleteNewsletterSubscriber
};
