const express = require("express");
const { check } = require("express-validator");

const userControllers = require("../controllers/user-controller");
const checkAuth = require("../middleware/check-auth");

const router = express.Router();

router.post("/login", userControllers.login);

router.post(
  "/register",
  [
    check("name").not().isEmpty(),
    check("email").normalizeEmail().isEmail({ min: 5 }),
    check("password").isLength({ min: 6 }),
  ],
  userControllers.register
);

router.get("/logout", userControllers.logout);

router.get("/refetch", userControllers.refetch);

router.get("/user/:id", userControllers.getUserById);

router.delete("/user/:id", userControllers.deleteUser);

module.exports = router;
