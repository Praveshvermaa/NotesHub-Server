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
  { timestamps: true } // Adding timestamps (createdAt, updatedAt)
);

// Create and export the model based on the schema
module.exports = mongoose.model("Paper", paperSchema);
