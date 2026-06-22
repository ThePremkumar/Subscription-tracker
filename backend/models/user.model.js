import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'User Name is required'], // frist is needed, error message
        trim: true, // remove the empty space
        minLength: 2, //minimum character
        maxLength:50, // maximum character
    },
    email: {
        type: String,
        required: [true, 'User Email is required'],
        unique: true,
        trim: true, // remove the empty space
        lowercase: true,
        match: [/\S+@\S+\.\S+/, 'Please fill a valid email address'],
    },
    password: {
        type: String,
        required: [true, 'User Password is required'],
        minLength: 6,
    }
}, {timestamps: true}// it for when the user create, update it)
);

const User = mongoose.model('User', userSchema);

export default User;