// backend/controllers/noteController.js
const Note = require('../models/note');
const Paper = require('../models/paper');
const User = require('../models/user');

const uploadNote = async (req, res) => {
  try {

    const { subject, department, semester, year, description } = req.body;
    
    
    
    
    const fileUrl = req.file.path;
    console.log(subject,department,fileUrl);

    
    const note = new Note({
      subject,
      department,
      semester,
      year,
      description,
      fileUrl,
      uploader: req.user.id, 
    });

   
    await note.save();

   
    await User.findByIdAndUpdate(req.user.id, {
      $push: { notesIds: note._id },
    });

    
    res.status(201).json({
      success: true,
      message: 'Note uploaded successfully',
      note,
    });
  } catch (error) {
    
    console.error(error);
    
   
    res.status(500).json({ 
      error: 'Failed to upload note. Please try again later.',
    });
  }
};
const uploadPaper = async (req, res) => {
  try {
    
    const { subject, department, year } = req.body;
    
    const existingPapers = await Paper.find({ subject, department, year });

    if (existingPapers.length) {
      return res.status(400).json({
        success: false,
        message: 'Already uploaded!',
      });
    }
    
    
   
    const fileUrl = req.file.path;
    console.log(fileUrl);

    const paper = new Paper({
      subject,
      department,
      year,
      fileUrl,
    });

    
    await paper.save();

  

    res.status(201).json({
      success: true,
      message: 'uploaded successfully',
      paper,
    });
  } catch (error) {
    
    console.error(error);
    
    
    res.status(500).json({ 
      error: 'Failed to upload note. Please try again later.',
    });
  }
};



module.exports = { uploadNote,uploadPaper };
