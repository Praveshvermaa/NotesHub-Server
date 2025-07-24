const mongoose = require("mongoose");

// Define the schema for storing notes metadata
const paperSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      required: true,
    },
    year: {
      type: String,
      required: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
  },
  { timestamps: true } 
);


module.exports = mongoose.model("Paper", paperSchema);
