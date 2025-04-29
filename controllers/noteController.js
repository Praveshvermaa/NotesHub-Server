// backend/controllers/noteController.js
const Note = require('../models/note');
const Paper = require('../models/paper');
const User = require('../models/user');

const uploadNote = async (req, res) => {
  try {
    // Destructure the data from the request body
    const { subject, department, semester, year, description } = req.body;
    
    
    
    // Get the file URL from Cloudinary
    const fileUrl = req.file.path;
    console.log(subject,department,fileUrl);

    // Create a new note with the data and file URL
    const note = new Note({
      subject,
      department,
      semester,
      year,
      description,
      fileUrl,
      uploader: req.user.id,  // Assuming the user is authenticated
    });

    // Save the note to the database
    await note.save();

    // Optionally, update the user's document to include the new note ID
    await User.findByIdAndUpdate(req.user.id, {
      $push: { notesIds: note._id },
    });

    // Respond with the success message and the newly created note
    res.status(201).json({
      success: true,
      message: 'Note uploaded successfully',
      note,
    });
  } catch (error) {
    // Log the error for debugging
    console.error(error);
    
    // Respond with an error message
    res.status(500).json({ 
      error: 'Failed to upload note. Please try again later.',
    });
  }
};
const uploadPaper = async (req, res) => {
  try {
    // Destructure the data from the request body
    const { subject, department, year } = req.body;
    
    const existingPapers = await Paper.find({ subject, department, year });

    if (existingPapers.length) {
      return res.status(400).json({
        success: false,
        message: 'Already uploaded!',
      });
    }
    
    
    // Get the file URL from Cloudinary
    const fileUrl = req.file.path;
    console.log(fileUrl);

    // Create a new note with the data and file URL
    const paper = new Paper({
      subject,
      department,
      year,
      fileUrl,
    });

    
    await paper.save();

    // Optionally, update the user's document to include the new note ID
  

    // Respond with the success message and the newly created note
    res.status(201).json({
      success: true,
      message: 'uploaded successfully',
      paper,
    });
  } catch (error) {
    // Log the error for debugging
    console.error(error);
    
    // Respond with an error message
    res.status(500).json({ 
      error: 'Failed to upload note. Please try again later.',
    });
  }
};



module.exports = { uploadNote,uploadPaper };
