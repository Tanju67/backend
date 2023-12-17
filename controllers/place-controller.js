const Place = require("../models/Place");
const User = require("../models/User");
const getCoordsForAddress = require("../utils/location");
const HttpError = require("../models/error");
const { validationResult } = require("express-validator");

////////////////////////////////////////
//GET ALL PLACES get /api/v1/place
exports.getAllPlaces = async (req, res, next) => {
  // find all places on db
  let allPlaces = [];
  try {
    allPlaces = await Place.find({}).sort({ updatedAt: -1 });
  } catch (error) {
    return next(new HttpError("Something went wrong.Try again.", 500));
  }

  //if there isn't any place, send error msg
  if (allPlaces.length === 0) {
    return next(new HttpError("Could not find  places", 404));
  }

  //send response
  res.status(200).json({ places: allPlaces });
};

////////////////////////////////////////
//GET USER PLACES get /api/v1/place/user/:id
exports.getUserPlaces = async (req, res, next) => {
  //get user id from req.params
  const userId = req.params.id;

  //find places for user id on db
  let userPlaces = [];
  try {
    userPlaces = await Place.find({ creator: userId });
  } catch (error) {
    return next(new HttpError("Something went wrong.Try again.", 500));
  }

  //if there isn't any place, send error msg
  if (userPlaces.length === 0) {
    return next(new HttpError("Could not find  places", 404));
  }

  //send response
  res.status(200).json({ places: userPlaces });
};

////////////////////////////////////////
//GET SINGLE PLACE get /api/v1/place/:id
exports.getPlaceById = async (req, res, next) => {
  //get place id from req.params
  const placeId = req.params.id;

  //find place for this id on db
  let place;
  try {
    place = await Place.findById({ _id: placeId });
  } catch (error) {
    return next(new HttpError("Something went wrong.Try again.", 500));
  }

  //if there isn't any place, send error msg
  if (!place) {
    return next(
      new HttpError("Could not find  place for the provided id.", 404)
    );
  }

  //send response
  res.status(200).json({ place: place });
};

////////////////////////////////////////
//CREATE PLACE post api/v1/place
exports.createPlace = async (req, res, next) => {
  console.log(req.image);
  //validator result
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed,please check your data.", 422)
    );
  }

  //get inputs from req.body
  const { title, address, description } = req.body;

  //tronsform address to geocode
  let coordinates;
  try {
    coordinates = await getCoordsForAddress(address);
  } catch (error) {
    next(error);
  }

  //create place based on place model
  const newPlace = new Place({
    title,
    description,
    // image: req.file?.path,
    image: req.image.secure_url,
    address,
    location: coordinates,
    creator: req.userData.userId,
  });

  //find user based on creator input
  let user;
  try {
    user = await User.findById(req.userData.userId);
  } catch (error) {
    return next(new HttpError("Creating place failed,please try again.!", 500));
  }

  //id there isn't a user for creator id, return error msg
  if (!user) {
    return next(new HttpError("Could not find user", 404));
  }

  //save place on db
  try {
    await newPlace.save();
  } catch (error) {
    return next(
      new HttpError("Creating place failed,please try again.:)", 500)
    );
  }

  //send response
  res.status(201).json({ message: "Place created successfully!" });
};

////////////////////////////////////////
//UPDATE PLACE patch /api/v1/place/:id
exports.updatePlace = async (req, res, next) => {
  //validator result
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed,please check your data.", 422)
    );
  }

  //get place id from req.params
  const placeId = req.params.id;

  //get inputs from req.body
  const { title, description } = req.body;

  //find place on db in order to update
  let place;
  try {
    place = await Place.findById(placeId);
  } catch (error) {
    return next(new HttpError("Something went wrong.Try again.", 500));
  }

  //if there isn't any place, send error msg
  if (!place) {
    return next(
      new HttpError("Could not find  place for the provided id.", 404)
    );
  }

  //check place created ba logged in user
  if (place.creator.toString() !== req.userData.userId.toString()) {
    return next(new HttpError("You are not allowed to edit this place", 401));
  }

  //updata place
  place.title = title;
  place.description = description;

  //save changment on db
  try {
    place.save();
  } catch (error) {
    return next(new HttpError("Something went wrong.", 500));
  }

  //send response
  res.status(200).json(place);
};

////////////////////////////////////////
//DELETE PLACE delete /api/v1/place/:id
exports.deletePlace = async (req, res, next) => {
  //get place id from req.params
  const placeId = req.params.id;

  // find place for this id on db and delete
  let place;
  try {
    place = await Place.findByIdAndDelete(placeId);
  } catch (error) {
    return next(new HttpError("Something went wrong.Try again.", 500));
  }

  if (!place) {
    return next(
      new HttpError("Could not find  place for the provided id.", 404)
    );
  }

  //send response
  res.status(200).json({ message: "Place deleted" });
};
