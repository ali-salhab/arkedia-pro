const router = require("express").Router();
const { searchHotels, getHotelRooms } = require("../controllers/publicSearchController");

router.get("/hotels/search", searchHotels);
router.get("/hotels/:id/rooms", getHotelRooms);

module.exports = router;
