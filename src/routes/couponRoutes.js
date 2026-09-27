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
 getAvailableCoupons,
 updateCoupon,
 deleteCoupon,
 applyCoupon
} = require("../controllers/couponController");

router.post(
 "/apply",
 auth,
 applyCoupon
);

router.post(
 "/validate",
 auth,
 applyCoupon
);

router.get("/available", auth, getAvailableCoupons);

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
