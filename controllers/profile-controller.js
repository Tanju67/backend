const { validationResult } = require("express-validator");
const Profile = require("../models/profile");
const HttpError = require("../models/error");
const User = require("../models/User");

////////////////////////////////////////
//CREATE PROFILE post /api/v1/profile
exports.postUserprofile = async (req, res, next) => {
  //validator result
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed,please check your data.", 422)
    );
  }

  //get inputs from req.body
  const { firstName, lastName, birthYear, country, address } = req.body;

  //check if there is profile on db
  let profile;
  try {
    profile = await Profile.findOne({ creator: req.userData.userId });
  } catch (error) {
    return next(
      new HttpError("Creating profile failed,please try again.", 500)
    );
  }

  if (profile) {
    //if there is profile on db,update
    profile.firstName = firstName;
    profile.lastName = lastName;
    profile.birthYear = birthYear;
    profile.country = country;
    profile.address = address;
    profile.image = req.image.secure_url;

    try {
      await profile.save();
    } catch (error) {
      new HttpError("Updating profile failed,please try again.", 500);
    }

    res
      .status(201)
      .json({ message: "Profile updated successfully.", image: profile.image });
  } else {
    //if there isn't profile on db,create
    const newProfile = new Profile({
      firstName,
      lastName,
      birthYear,
      country,
      address,
      image: req.image.secure_url,
      creator: req.userData.userId,
    });

    try {
      await newProfile.save();
      await User.findOneAndUpdate(
        { _id: req.userData.userId },
        { profile: newProfile._id }
      );
    } catch (error) {
      new HttpError("Creating profile failed,please try again.", 500);
    }

    //send response
    res.status(201).json({
      message: "Profile created successfully.",
      image: newProfile.image,
    });
  }
};

////////////////////////////////////////
//GET PROFILE get /api/v1/profile/:id
exports.getProfileById = async (req, res, next) => {
  //get user id from req.params
  const userId = req.params.id;

  //find profile for user id on db
  let userProfile = [];
  try {
    userProfile = await Profile.find({ creator: userId });
  } catch (error) {
    return next(new HttpError("Something went wrong.Try again.", 500));
  }

  //if there isn't any profile, send error msg
  if (userProfile.length === 0) {
    return res.status(200).json({ profile: userProfile });
  }

  //send response
  res.status(200).json({ profile: userProfile });
};
