const express = require("express");
const router = express.Router();
const { register, login, logout,resendVerification } = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
const jwt = require("jsonwebtoken");
const User = require("../models/user")
const bcrypt = require("bcryptjs");
const sendEmail = require("../utils/sendEmail");
const nodemailer = require("nodemailer");



router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);

router.get("/check-auth", authMiddleware, (req, res) => {
    res.status(200).json({
      success: true,
      message: "User authenticated",
      user: req.user,  
    });
  });

router.post("/resend-verification", resendVerification);


router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  // Check if user exists
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: "Email doesn't exist!" });
  }

  
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "15m" });
  const resetLink = `${process.env.CLIENT_URL}/reset-password/${token}`;

 
  const transporter = nodemailer.createTransport({
    service: "gmail", // 
    auth: {
      user: process.env.EMAIL_USER, 
      pass: process.env.EMAIL_PASS, 
    },
  });

  
  const mailOptions = {
    from: `"NotesHub" <${process.env.EMAIL_USER}>`, 
    to: email,
    subject: "Reset Your Password", 
    html: `<p>Click the link below to reset your password:</p><a href="${resetLink}">${resetLink}</a>`,
  };

  try {
  
    await transporter.sendMail(mailOptions);
    res.json({ message: "Reset link sent to your email." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error sending email. Please try again." });
  }
});



router.post("/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.findByIdAndUpdate(decoded.id, { password: hashedPassword });

    res.json({success:true, message: "Password reset successful." });
  } catch (err) {
    res.status(400).json({ message: "Invalid or expired token." });
  }
});




module.exports = router;
