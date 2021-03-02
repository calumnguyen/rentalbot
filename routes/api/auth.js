const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const { check, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const config = require("config");
const bcrypt = require("bcryptjs");
const moment = require("moment");

const User = require("../../models/User");

// @route   GET api/auth
// @desc    Verify token and get User
// @access  Private
router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    console.log(err);
    res.status(500).send({ msg: "Server Error" });
  }
});

// @route   POST api/auth
// @desc    Authenticate User and get Token
// @access  Public
router.post(
  "/",
  [
    check("username", "Username Required").exists(),
    check("password", "Password Required").exists(),
  ],
  async (req, res) => {
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    try {
      // check for existing user
      let user = await User.findOne({ username });

      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "User does not exists" }] });
      }
      const salt = await bcrypt.genSalt(10);
      const passwordEntered = await bcrypt.hash(password, salt);

      // check if user is active or not...
      if (user.accountStatus !== "active") {
        return res.status(403).json({
          errors: [
            {
              msg: `Sorry! User is not activated. Inactivated on ${moment(
                user.inactivated_date
              ).format("DD-MMM-YYYY")}`,
            },
          ],
        });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(400).json({ errors: [{ msg: "Invalid Password" }] });
      }

      const payload = {
        user: {
          id: user._id,
          name: user.username,
        },
      };

      jwt.sign(
        payload,

        config.get("jwtSecret"),
        { expiresIn: "1d" },

        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.log(err);
      res.status(500).json({ errors: [{ msg: "Server error" }] });
    }
  }
);

router.post("/verify_email",
  [
    check('email', 'email Required').exists(),
    check('password', 'Password Required').exists(),
  ],async () => {
   try {
    const { email, password } = req.body;
 // check for existing user
      let userCheck = await User.findOne({ email })

      if (userCheck) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'email already exists' }] })
     }
       const salt = await bcrypt.genSalt(10)
      const passwordEntered = await bcrypt.hash(password, salt)

    const user = new User({ email:email, password:passwordEntered });

    await user.save();

    return res.json({
      data: user,
      message: "User Register Successfully",
      status: 200,
    });
  } catch (err) {
      res.status(500).json({ errors: [{ msg: 'Server error' }] })
    }
});

router.post(
  "/signup",
  [
    check("first_name", "First Name is Required").not().isEmpty(),
    check("last_name", "Last Name is Required").not().isEmpty(),
    check("email", "Please Enter a Valid Email").isEmail(),
    check("contactnumber", "Please Enter Contact Number").not().isEmpty(),
    check("gender", "Please select your Gender").not().isEmpty(),
    check("dob", "Please select your dob").not().isEmpty(),
    check(
      "password",
      "Please Enter a password with 6 or more characters"
    ).isLength({ min: 6 }),
    check("company", "First Name is Required").not().isEmpty(),
    check("company_address", "Last Name is Required").not().isEmpty(),
  ],
  async (req, res) => {
    try {
      let body = JSON.parse(JSON.stringify(req.body));

      const userByEmail = await User.findOne({ email: body.email });
      const userByUsername = await User.findOne({ username: body.username });

      if (userByEmail) {
        return res
          .status(422)
          .json({ errors: [{ msg: "User with this Email already exists" }] });
      }
      // if (userByUsername) {
      //   return res.status(500).json({
      //     errors: [{ msg: "User with this Username already exists" }],
      //   });
      // }
      const avatar = gravatar.url(body.email, {
        s: "200",
        r: "pg",
        d: "mm",
      });
      let userBody;
      const salt = await bcrypt.genSalt(10);

      const password = await bcrypt.hash(body.password, salt);
      userBody = { ...body, avatar, password };
      let user = new User(userBody);
      await user.save();

      res.status(200).json({ user, msg: "User Added Successfully" });
    } catch (err) {
      res.status(500).json({ msg: err });
    }
  }
);
module.exports = router;
