const express =
require("express");

const router =
express.Router();

const {
 auth,
 admin
} = require("../middleware/auth");

const {
 createContact,
 getContacts,
 updateContactStatus,
 deleteContact
} = require("../controllers/contactController");

router.post(
 "/",
 createContact
);

router.get(
 "/admin",
 auth,
 admin,
 getContacts
);

router.patch("/admin/:id", auth, admin, updateContactStatus);

router.delete(
 "/admin/:id",
 auth,
 admin,
 deleteContact
);

module.exports =
router;
