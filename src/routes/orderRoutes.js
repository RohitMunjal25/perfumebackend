const express =
require("express");

const router =
express.Router();

const {
 auth,
 admin
} = require("../middleware/auth");

const {
 createOrder,
 getMyOrders,
 getMyOrder,
 getOrders,
 getOrder,
 updateOrder
} = require("../controllers/orderController");

router.post(
 "/",
 auth,
 createOrder
);

router.get(
 "/my-orders",
 auth,
 getMyOrders
);

router.get(
 "/admin",
 auth,
 admin,
 getOrders
);

router.get(
 "/admin/:id",
 auth,
 admin,
 getOrder
);

router.patch(
 "/admin/:id",
 auth,
 admin,
 updateOrder
);

router.get(
 "/:id",
 auth,
 getMyOrder
);

module.exports =
router;
