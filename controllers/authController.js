const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const JWT_SECRET = process.env.JWT_SECRET;

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

exports.register = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ success: false, message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(verificationToken).digest("hex");
    const expireTime = Date.now() + 3600000; // 1 hour from now

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      emailVerifyToken: hashedToken,
      emailVerifyExpire: expireTime,
    });

    
    const verifyUrl = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;

    
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER, //  Gmail
        pass: process.env.EMAIL_PASS, //  App password
      },
    });

    await transporter.sendMail({
      from: `"NotesHub" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Verify your email",
      html: `<p>Hello ${name},</p>
             <p>Please click the link below to verify your email:</p>
             <a href="${verifyUrl}">${verifyUrl}</a>`,
    });

    res.status(201).json({ success: true, message: "Registration successful. Check your email to verify." });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error during registration" });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({success: false, message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ success: false,message: "Invalid credentials" });

    if (!user.isVerified) {
      return res.status(403).json({ notVerified: true, message: "Your email is not verify!!" });
    }

    const token = generateToken(user._id);

    
    const { password: hashedPassword, ...safeUser } = user._doc;

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", //  only true in production
      sameSite: "None",
      maxAge: 24 * 60 * 60 * 1000,
    });
    

    res.json({ success: true, message: "Login successful", user: safeUser });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error during login" });
  }
};


exports.logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "None",
  });
  res.json({ success: true, message: "Logged out successfully" });
};

exports.resendVerification = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, message: "Email is already verified" });
    }

   
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(verificationToken).digest("hex");
    const expireTime = Date.now() + 3600000; // 1 hour

    user.emailVerifyToken = hashedToken;
    user.emailVerifyExpire = expireTime;

    await user.save();

   
    const verifyUrl = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;

    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"NotesHub" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Resend: Verify your email",
      html: `<p>Hello ${user.name},</p>
             <p>Please click the link below to verify your email:</p>
             <a href="${verifyUrl}">${verifyUrl}</a>`,
    });

    return res.status(200).json({ success: true, message: "Verification email resent" });
  } catch (err) {
    console.error("Resend error:", err);
    return res.status(500).json({ success: false, message: "Server error while resending verification" });
  }
};

