const express = require("express");
const passport = require("passport");
const userController = require("../Controllers/User");
// const passportRef = require("../Passport/passport");
const { authenticate, authorize } = require("../Middlewares/Auth");

const multer = require("multer");

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "images");
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    }
  }),
  fileFilter: (req, file, cb) => {
    cb(null, true);
  }
});

//chỗ này sẽ cần phải sữa lại cách import, tại vì bên kia ta export ra một object có 2 thuộc tính, dùng spread operator bóc ra sử dung

const router = express.Router();

//enpoint: /users POST

router.post(
  "/",
  // authenticate,
  // authorize(["admin"]),
  userController.createUser()
);

//users GET
router.get("/", authenticate, userController.getUsers);

// /users/2345678
router.get("/:id", userController.getUserById);

// /users/1234567 DELETE
router.delete("/:id", userController.deleteUserById);

// /users/2348909876 PATCH {name: "dung", avatar: "456788789876"}
router.patch("/:id", userController.updateUserById);

// endpoint: /users/signup
router.post("/signup", userController.createUser(true));

router.post("/login", userController.login);

router.post(
  "/auth/facebook",
  passport.authenticate("AuthenticateWithFacebook", { session: false }),
  userController.authenticateWithFacebook
);

router.post(
  "/upload/avatar",
  authenticate,
  upload.single("file"),
  userController.uploadAvatar
);

module.exports = router;
