const express = require('express');
const connectDB = require('./config/db');
require('dotenv').config();
const cookieParser = require("cookie-parser");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const noteRoutes = require("./routes/noteRoutes");

const app = express();
const PORT = process.env.PORT || 8000;

connectDB();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRoutes);
app.use("/api/notes", noteRoutes);

app.get('/', (req, res) => {
    res.send("server is live");
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
