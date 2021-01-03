const user = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const registerUser = async (req, res) => {
  try {
    const { username, email, password, passwordCheck } = req.body;

    //Check existing email // username
    const existingEmail = await user.findOne({ email: email });

    const existingUsername = await user.findOne({ username: username });

    if (!email || !password || !passwordCheck || !username) {
      return res.status(400).json({ msg: "Not all fields have been entered" });
    }

    if (password.length < 8) {
      return res
        .status(400)
        .json({ msg: "Password need to be at least 8 characters long" });
    }

    if (password !== passwordCheck) {
      return res
        .status(400)
        .json({ msg: "Password and password check are not equals" });
    }

    if (existingEmail) {
      return res
        .status(400)
        .json({ msg: `An account with this email: ${email}, already exist` });
    }

    if (existingUsername) {
      return res.status(400).json({
        msg: `An account with this username: ${username}, already exist`,
      });
    }

    //Hash Password
    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = new user({
      username,
      email,
      password: passwordHash,
    });

    const savedUser = await newUser.save();
    res.json(savedUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  //const userEmail = await user.findOne({ email: email });
  //const userPasswordMatch = await bcrypt.compare(password, user.password);

  if (!email || !password) {
    res.status(400).json({ msg: "Missing fields" });
  }

  const userEmail = await user.findOne({ email: email });

  if (!userEmail) {
    res.status(400).json({ msg: "Incorrect email" });
  }

  const userPasswordMatch = await bcrypt.compare(password, userEmail.password);

  if (!userPasswordMatch) {
    res.status(400).json({ msg: "Incorrect password" });
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
  res.json({
    token,
    user: {
      id: userEmail._id,
      username: userEmail.username,
    },
  });
};

module.exports = { registerUser, loginUser };
