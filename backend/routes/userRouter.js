const router = require("express").Router();
const {
  registerUser,
  loginUser,
  Delete,
  tokenIsValid,
} = require("../controller/userController");
const auth = require("../middleware/auth");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.delete("/delete", auth, Delete);
router.post("/isTokenValid", tokenIsValid);

module.exports = router;
