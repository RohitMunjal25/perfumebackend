const express =
require("express");

const router =
express.Router();

const {
 auth,
 admin
} = require("../middleware/auth");

const {
 createCoupon,
 getCoupons,
 updateCoupon,
 deleteCoupon,
 applyCoupon
} = require("../controllers/couponController");

router.post(
 "/apply",
 applyCoupon
);

router.post(
 "/",
 auth,
 admin,
 createCoupon
);

router.get(
 "/",
 auth,
 admin,
 getCoupons
);

router.put(
 "/:id",
 auth,
 admin,
 updateCoupon
);

router.delete(
 "/:id",
 auth,
 admin,
 deleteCoupon
);

module.exports =
router;
