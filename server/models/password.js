const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const passwordSchema = new Schema({
  title: { type: String, required: true },
  password: { type: String, required: true },
  owner: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
});

module.exports = mongoose.model("Password", passwordSchema);
