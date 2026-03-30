const Hotel = require("../models/Hotel");
const Room = require("../models/Room");

/**
 * GET /api/public/hotels/search?q=...
 * Public (no auth). Returns matching hotels with thumbnail + stars.
 */
exports.searchHotels = async (req, res, next) => {
  try {
    const q = String(req.query.q || "").trim();
    if (!q) return res.json([]);

    const regex = new RegExp(q, "i");
    const hotels = await Hotel.find({
      $or: [
        { name: regex },
        { city: regex },
        { country: regex },
        { location: regex },
      ],
    })
      .select("name city country stars thumbnail location")
      .limit(15)
      .lean();

    res.json(hotels);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/public/hotels/:id/rooms?checkIn=...&checkOut=...&rooms=1&adults=2&children=0
 * Public. Returns available rooms for a hotel.
 */
exports.getHotelRooms = async (req, res, next) => {
  try {
    const { id } = req.params;
    const rooms = await Room.find({ hotelId: id, status: "available" })
      .select("number name type category capacity beds bedType pricePerNight currency discount sizeM2 view amenities thumbnail description")
      .lean();

    res.json(rooms);
  } catch (err) {
    next(err);
  }
};
