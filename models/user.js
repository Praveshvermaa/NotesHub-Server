const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    notesIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Note'
    }],
    isVerified: {
        type: Boolean,
        default: false
    },
    emailVerifyToken: {
        type: String
    },
    emailVerifyExpire: {
        type: Date
    }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
