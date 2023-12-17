const express = require("express");
const { check } = require("express-validator");

const cloudinary = require("../utils/cloudinary");

const streamifier = require("streamifier");

const checkAuth = require("../middleware/check-auth");
const fileUpload = require("../middleware/file-upload");
const profileControllers = require("../controllers/profile-controller");

const router = express.Router();

router.get("/:id", profileControllers.getProfileById);

router.use(checkAuth);

router.post(
  "/",
  fileUpload.single("image"),
  async function (req, res, next) {
    let streamUpload = (req) => {
      return new Promise((resolve, reject) => {
        let stream = cloudinary.uploader.upload_stream((error, result) => {
          if (result) {
            resolve(result);
          } else {
            reject(error);
          }
        });

        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
    };

    async function upload(req) {
      let result = await streamUpload(req);
      console.log(result);
      return result;
    }
    req.image = await upload(req);
    next();
  },
  [
    check("firstName").not().isEmpty(),
    check("lastName").not().isEmpty(),
    check("birthYear").not().isEmpty(),
    check("country").not().isEmpty(),
    check("address").not().isEmpty(),
  ],
  profileControllers.postUserprofile
);

module.exports = router;
