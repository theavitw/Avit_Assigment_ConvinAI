const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    mobileNumber: {
        type: String,
    },
    password: {
        type: String,
        required: true,
    },
});

const Users = mongoose.model("User", UserSchema);
module.exports = Users;
