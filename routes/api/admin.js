const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const { check, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const config = require("config");
const bcrypt = require("bcryptjs");
const moment = require("moment");

const User = require("../../models/User");

// @route   GET api/admin/all_inactive_users
// @desc    Verify token and get User
// @access  Private
router.get("/all_inactive_users", auth, async (req, res) => {
  try {
    const user = await User.find({ accountStatus: "inactive" });
    return res.json(user);
  } catch (err) {
    console.log(err);
    res.status(500).send({ msg: "Server Error" });
  }
});

// @route   GET api/admin/all_active_users
// @desc    Verify token and get User
// @access  Private
router.get("/all_active_users", auth, async (req, res) => {
  try {
    const user = await User.find({ accountStatus: "active" });
    return res.json(user);
  } catch (err) {
    console.log(err);
    res.status(500).send({ msg: "Server Error" });
  }
});
// @route   GET api/admin/activate_user
// @desc    Verify token and get User
// @access  Private
router.post("/activate_user", auth, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.body.userId, {
      accountStatus: "active",
    });
    return res.json(user);
  } catch (err) {
    console.log(err);
    res.status(500).send({ msg: "Server Error" });
  }
});

// @route   GET api/admin/deactivate_user
// @desc    Verify token and get User
// @access  Private
router.post("/deactivate_user", auth, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.body.userId, {
      accountStatus: "inactive",
    });
    return res.json(user);
  } catch (err) {
    console.log(err);
    res.status(500).send({ msg: "Server Error" });
  }
});
module.exports = router;
