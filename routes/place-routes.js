const express = require("express");
const { check } = require("express-validator");
const HttpError = require("../models/error");

const checkAuth = require("../middleware/check-auth");

const fileUpload = require("../middleware/file-upload");

const cloudinary = require("../utils/cloudinary");

const streamifier = require("streamifier");

const placeControllers = require("../controllers/place-controller");

const router = express.Router();

router.get("/", placeControllers.getAllPlaces);

router.use(checkAuth);

router.get("/user/:id", placeControllers.getUserPlaces);

router.get("/:id", placeControllers.getPlaceById);

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
    check("title").not().isEmpty(),
    check("description").not().isEmpty(),
    check("address").not().isEmpty(),
  ],
  placeControllers.createPlace
);

router.patch(
  "/:id",
  [check("title").not().isEmpty(), check("description").not().isEmpty()],
  placeControllers.updatePlace
);

router.delete("/:id", placeControllers.deletePlace);

module.exports = router;
