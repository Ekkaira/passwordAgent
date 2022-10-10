const { validationResult } = require("express-validator");
const mongoose = require("mongoose");

const HttpError = require("../models/http-error");
const Password = require("../models/password");
const User = require("../models/user");

const getPassById = async (req, res, next) => {
  const passId = req.params.pid;

  let password;
  try {
    password = await Password.findById(passId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not find a password.",
      500
    );
    return next(error);
  }

  if (!password) {
    const error = new HttpError(
      "Could not find a passwords for the provided id.",
      404
    );
    return next(error);
  }

  res.json({ password: password.toObject({ getters: true }) });
};

const getPassesByUserId = async (req, res, next) => {
  const userId = req.params.uid;

  let userWithPasswords;
  try {
    userWithPasswords = await User.findById(userId).populate("passwords");
  } catch (err) {
    const error = new HttpError(
      "Fetching passwords failed, please try again later.",
      500
    );
    return next(error);
  }

  if (!userWithPasswords || userWithPasswords.passwords.length === 0) {
    return next(
      new HttpError("Could not find places for the provided user id.", 404)
    );
  }

  res.json({
    passwords: userWithPasswords.passwords.map((password) =>
      password.toObject({ getters: true })
    ),
  });
};

const createPass = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }

  const { title, password } = req.body;

  const createdPass = new Password({
    title,
    password,
    owner: req.userData.userId,
  });

  let user;

  try {
    user = await User.findById(req.userData.userId);
  } catch (err) {
    const error = new HttpError(
      "Creating password failed, please try again.",
      500
    );
    return next(error);
  }

  if (!user) {
    const error = new HttpError("Could not find user for provided id.", 404);
    return next(error);
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdPass.save({ session: sess });
    user.passwords.push(createdPass);
    await user.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      "Creating place failed, please try again.",
      500
    );
    return next(error);
  }

  res.status(201).json({ password: createdPass });
};

const updatePass = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }

  const { title, password } = req.body;
  const passId = req.params.pid;

  let pass;
  try {
    pass = await Password.findById(passId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not edit password.",
      500
    );
    return next(error);
  }

  if (pass.owner.toString() !== req.userData.userId) {
    const error = new HttpError(
      "You are not allowed to edit this password.",
      401
    );
    return next(error);
  }
  pass.title = title;
  pass.password = password;

  try {
    await pass.save();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not edit password.",
      500
    );
    return next(error);
  }

  res.status(200).json({ pass: pass.toObject({ getters: true }) });
};

const deletePass = async (req, res, next) => {
  const passId = req.params.pid;

  let pass;
  try {
    pass = await Password.findById(passId).populate("owner");
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not delete password.",
      500
    );
    return next(error);
  }

  if (!pass) {
    const error = new HttpError("Could not find password for this id.", 404);
    return next(error);
  }

  if (pass.owner.id !== req.userData.userId) {
    const error = new HttpError(
      "You are not allowed to delete this password.",
      401
    );
    return next(error);
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await pass.remove({ session: sess });
    pass.owner.passwords.pull(pass);
    await pass.owner.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not delete place.",
      500
    );
    return next(error);
  }

  res.status(200).json({ message: "Deleted password." });
};

exports.getPassById = getPassById;
exports.getPassesByUserId = getPassesByUserId;
exports.createPass = createPass;
exports.updatePass = updatePass;
exports.deletePass = deletePass;
