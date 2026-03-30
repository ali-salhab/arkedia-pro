const router = require("express").Router();
const {
  searchHotels,
  getHotelDetails,
  getHotelRooms,
  getHotelsByLocation,
  createPublicBooking,
} = require("../controllers/publicSearchController");

router.get("/hotels/search", searchHotels);
router.get("/hotels/by-location", getHotelsByLocation);
router.get("/hotels/:id", getHotelDetails);
router.get("/hotels/:id/rooms", getHotelRooms);
router.post("/bookings", createPublicBooking);

module.exports = router;
