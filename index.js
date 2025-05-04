const express = require('express');
const connectDB = require('./config/db');
require('dotenv').config();
const cookieParser = require("cookie-parser");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const noteRoutes = require("./routes/noteRoutes");
const emailVerifyRoute = require('./routes/emailVerify')

const app = express();
const PORT = process.env.PORT || 8000;

connectDB();
const allowedOrigins = [
  "http://localhost:5173",
  "https://notes-hub-client-weld.vercel.app"
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api",emailVerifyRoute);

app.get('/', (req, res) => {
    res.send("server is live");
});



app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
