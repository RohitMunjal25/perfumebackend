const Product =
require("../models/Product");


// ADD PRODUCT

const addProduct =
async(req,res)=>{

 try{

  const product =
  await Product.create(
   req.body
  );

  res.status(201).json({
   success:true,
   product
  });

 }catch(error){

  res.status(500).json({
   success:false,
   message:error.message
  });

 }

};


// GET ALL PRODUCTS

const getProducts =
async(req,res)=>{

 try{

  const filter = {};

  if(req.query.category){
   filter.category = req.query.category;
  }

  if(req.query.targetPage){
   filter.targetPages = req.query.targetPage;
  }

  if(req.query.homepageSection){
   filter.homepageSections = req.query.homepageSection;
  }

  if(req.query.featured){
   filter.featured = req.query.featured === "true";
  }

  const products =
  await Product.find(filter)
  .sort({createdAt:-1});

  res.json({
   success:true,
   products
  });

 }catch(error){

  res.status(500).json({
   success:false,
   message:error.message
  });

 }

};


// GET SINGLE PRODUCT

const getProduct =
async(req,res)=>{

 try{

  const product =
  await Product.findById(
   req.params.id
  );

  if(!product){

   return res.status(404).json({
    success:false,
    message:"Product not found"
   });

  }

  res.json({
   success:true,
   product
  });

 }catch(error){

  res.status(500).json({
   success:false,
   message:error.message
  });

 }

};


// UPDATE PRODUCT

const updateProduct =
async(req,res)=>{

 try{

  const product =
  await Product.findByIdAndUpdate(
   req.params.id,
   req.body,
   {
    new:true,
    runValidators:true
   }
  );

  if(!product){
   return res.status(404).json({
    success:false,
    message:"Product not found"
   });
  }

  res.json({
   success:true,
   product
  });

 }catch(error){

  res.status(500).json({
   success:false,
   message:error.message
  });

 }

};


// DELETE PRODUCT

const deleteProduct =
async(req,res)=>{

 try{

  const product =
  await Product.findByIdAndDelete(
   req.params.id
  );

  if(!product){
   return res.status(404).json({
    success:false,
    message:"Product not found"
   });
  }

  res.json({
   success:true,
   message:"Product deleted"
  });

 }catch(error){

  res.status(500).json({
   success:false,
   message:error.message
  });

 }

};

module.exports = {

 addProduct,

 getProducts,

 getProduct,

 updateProduct,

 deleteProduct

};
