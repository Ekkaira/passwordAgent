const mongoose = require("mongoose");
const uniquieValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 6 },
  passwords: [
    { type: mongoose.Types.ObjectId, required: true, ref: "Password" },
  ],
});

userSchema.plugin(uniquieValidator);

module.exports = mongoose.model("User", userSchema);
