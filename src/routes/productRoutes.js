const express =
require("express");

const router =
express.Router();

const {
 auth,
 admin
} = require("../middleware/auth");

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
 auth,
 admin,
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
 auth,
 admin,
 updateProduct
);

router.patch(
 "/:id",
 auth,
 admin,
 updateProduct
);

router.patch(
 "/:id",
 auth,
 admin,
 updateProduct
);

router.delete(
 "/:id",
 auth,
 admin,
 deleteProduct
);

module.exports =
router;
