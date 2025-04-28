const express = require("express");
const router = express.Router();
const { register, login, logout } = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);

router.get("/check-auth", authMiddleware, (req, res) => {
    res.status(200).json({
      success: true,
      message: "User authenticated",
      user: req.user,  // The user information added by the middleware
    });
  });


module.exports = router;
