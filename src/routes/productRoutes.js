const express =
require("express");

const router =
express.Router();

const {

 addProduct,

 getProducts,

 getProduct,

 updateProduct,

 deleteProduct

} = require(
 "../controllers/ProductController"
);


router.post(
 "/",
 addProduct
);

router.get(
 "/",
 getProducts
);

router.get(
 "/:id",
 getProduct
);

router.put(
 "/:id",
 updateProduct
);

router.delete(
 "/:id",
 deleteProduct
);

module.exports =
router;