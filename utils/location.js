const HttpError = require("../models/error");

const getCoordsForAddress = async (address) => {
  const response = await fetch(
    `https://us1.locationiq.com/v1/search?key=pk.506cf89b282a03b03595c5fc9b490ee7&format=json&q=${encodeURIComponent(
      address
    )} `
  );

  const data = await response.json();
  const locData = data[0];

  if (!locData || locData.status === "ZERO_RESULTS") {
    const error = new HttpError(
      "Could not find location for the specified address.",
      422
    );
    return next(error);
  }

  const coorLat = locData.lat;
  const coorLon = locData.lon;
  const coordinates = {
    lat: coorLat,
    lng: coorLon,
  };

  return coordinates;
};

module.exports = getCoordsForAddress;
