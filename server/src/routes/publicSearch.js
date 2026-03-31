const router = require("express").Router();
const {
  searchHotels,
  getHotelDetails,
  getHotelRooms,
  getHotelsByLocation,
  createPublicBooking,
} = require("../controllers/publicSearchController");
const { getPublicSetting } = require("../controllers/publicSettingsController");

router.get("/hotels/search", searchHotels);
router.get("/hotels/by-location", getHotelsByLocation);
router.get("/hotels/:id", getHotelDetails);
router.get("/hotels/:id/rooms", getHotelRooms);
router.post("/bookings", createPublicBooking);
router.get("/app-settings/:key", getPublicSetting);

module.exports = router;
