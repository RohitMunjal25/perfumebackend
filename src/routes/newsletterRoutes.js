const express =
require("express");

const router =
express.Router();

const {
 auth,
 admin
} = require("../middleware/auth");

const {
 subscribeNewsletter,
 getNewsletterSubscribers,
 deleteNewsletterSubscriber
} = require("../controllers/newsletterController");

router.post(
 "/",
 subscribeNewsletter
);

router.get(
 "/admin",
 auth,
 admin,
 getNewsletterSubscribers
);

router.delete(
 "/admin/:id",
 auth,
 admin,
 deleteNewsletterSubscriber
);

module.exports =
router;
