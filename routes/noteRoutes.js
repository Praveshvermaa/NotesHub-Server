const express = require('express');
const router = express.Router();
const upload = require('../utils/cloudinary'); // Cloudinary upload configuration
const { uploadNote, uploadPaper } = require('../controllers/noteController'); 
const authMiddleware = require('../middleware/authMiddleware');
const Note = require('../models/note');
const paper = require('../models/paper');
const User = require('../models/user');
const { v2: cloudinary } = require("cloudinary");


// Define the route for uploading notes
router.post('/upload', authMiddleware, upload.single('file'), uploadNote);
router.post('/uploadpaper', authMiddleware, upload.single('file'), uploadPaper);



// fetching of notes by uploader
router.get('/fetch-all', authMiddleware, async (req, res) => {
  try {
    const uploaderId = req.user._id;
    const notes = await Note.find({ uploader: uploaderId });
    // Fetch only the notes uploaded by the current user
    res.status(200).json({ success: true, notes });  // Send the notes to the frontend
  } catch (error) {
    console.error("Error fetching notes:", error);
    res.status(500).json({ message: "Error fetching notes" });
  }
});
// DELETE /notes/delete/:id
router.delete("/delete/:id", authMiddleware, async (req, res) => {
  try {
    const noteId = req.params.id;
    const note = await Note.findById(noteId);
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    function extractPublicId(url) {
      const parts = url.split("/");
      const filenameWithExt = parts[parts.length - 1];
      const publicId = filenameWithExt.split(".")[0];
      return publicId;
    }
    if (note.fileUrl) {
      const publicId = extractPublicId(note.fileUrl);
      await cloudinary.uploader.destroy(publicId);
      console.log("delete from cloudinary");
      
    }

   
    if (note.uploader) {
      await User.findByIdAndUpdate(req.user._id, {
        $pull: { notesIds: note._id }
      });
    }

    
    await Note.findByIdAndDelete(noteId);

    res.status(200).json({ message: "Note deleted successfully" });
  } catch (error) {
    console.error("Delete Error:", error);
    res.status(500).json({ message: "Failed to delete note", error });
  }
});




router.post("/", async (req, res) => {
  const { branch, semester, year } = req.body;

  try {
    const notes = await Note.aggregate([
      { $match: { department: branch, semester, year } },
      {
        $addFields: {
          averageRating: {
            $cond: [
              { $eq: ["$totalRatingUsers", 0] },
              0,
              { $divide: ["$ratingSum", "$totalRatingUsers"] }
            ]
          }
        }
      },
      {
        $lookup: {
          from: "users", 
          localField: "uploader",
          foreignField: "_id",
          as: "uploaderInfo"
        }
      },
      { $unwind: "$uploaderInfo" }, 
      { $sort: { averageRating: -1 } }
    ]);

    res.status(200).json({ success: true, notes });
  } catch (error) {
    console.error("Error fetching notes:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


router.post('/rate', async (req, res) => {
  const { noteId, rating } = req.body;

  if (!noteId || !rating || rating < 1 || rating > 5) {
    return res.status(400).json({ message: 'Invalid data' });
  }

  try {
    const note = await Note.findById(noteId);
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    
    note.ratingSum += rating;
    note.totalRatingUsers += 1;

    await note.save();

    const avgRating = note.ratingSum / note.totalRatingUsers;

    res.status(200).json({
      success: true,
      message: 'Rating added successfully!',
      averageRating: avgRating.toFixed(1),
    });
  } catch (err) {
    console.error('Error rating note:', err);
    res.status(500).json({ message: 'Server error' });
  }
});




router.get('/search', async (req, res) => {
  const { subject } = req.query;

  try {
   
    const notes = await Note.aggregate([
      {
        $match: {
          subject: { $regex: new RegExp(subject, "i") }, 
        },
      },
      {
        $addFields: {
          averageRating: {
            $cond: {
              if: { $eq: ["$totalRatingUsers", 0] }, 
              then: 0,
              else: { $divide: ["$ratingSum", "$totalRatingUsers"] }, 
            },
          },
        },
      },
      {
        $lookup: {
          from: 'users', 
          localField: 'uploader',
          foreignField: '_id', 
          as: 'uploaderInfo', 
        },
      },
      {
        $unwind: '$uploaderInfo', 
      },
      {
        $addFields: {
          uploaderName: "$uploaderInfo.name",
        },
      },
      { $sort: { averageRating: -1 } }, 
    ]);

   
    res.status(200).json({
      success: true,
      notes,
      totalNotes: notes.length,
      subject,
    });
  } catch (error) {
    console.error("Error fetching notes:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


// previous papers fetching 
router.post("/previous-papers", async (req, res) => {
  const { branch, year } = req.body;

  if (!branch || !year) {
    return res.status(400).json({ success: false, message: "Branch and year are required" });
  }

  try {
    const papers = await paper.find({
      department: { $regex: new RegExp("^" + branch + "$", "i") },
      subject: { $regex: new RegExp("^" + year + "$", "i") },
    });
    res.status(200).json({ success: true, papers });
  } catch (err) {
    console.error("Error fetching papers:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


module.exports = router;




