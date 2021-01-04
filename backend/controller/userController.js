const user = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const auth = require("../middleware/auth");

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
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ msg: "Missing fields" });
    }

    const userEmail = await user.findOne({ email: email });

    if (!userEmail) {
      res.status(400).json({ msg: "Incorrect email" });
    }

    const userPasswordMatch = await bcrypt.compare(
      password,
      userEmail.password
    );

    if (!userPasswordMatch) {
      res.status(400).json({ msg: "Incorrect password" });
    }

    const token = jwt.sign({ id: userEmail._id }, process.env.JWT_SECRET);

    res.json({
      token,
      user: {
        id: userEmail._id,
        username: userEmail.username,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const Delete = async (req, res) => {
  try {
    const deletedUser = await user.findByIdAndDelete(req.user);
    res.json(deletedUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const tokenIsValid = async (req, res) => {
  try {
    const token = req.header("x-auth-token");

    if (!token) {
      return res.json(false);
    }

    const verified = jwt.verify(token, process.env.JWT_SECRET);
    if (!verified) {
      return res.json(false);
    }

    const userId = await user.findById(verified.id);

    if (!userId) {
      return res.json(false);
    }

    return res.json(true);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { registerUser, loginUser, Delete, tokenIsValid };
