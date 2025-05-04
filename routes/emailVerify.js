const express = require("express");
const router = express.Router();
const { verifyEmail } = require("../controllers/verifyEmail");

router.get("/verify-email/:token", verifyEmail);

module.exports = router;
