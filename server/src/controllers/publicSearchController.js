const Hotel = require("../models/Hotel");
const Room = require("../models/Room");
const Booking = require("../models/Booking");

/**
 * GET /api/public/hotels/search?q=...
 * Public (no auth). Returns matching hotels with thumbnail + stars + icons + starting price.
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
      .select("name city country stars thumbnail location description selectedIcons")
      .populate("selectedIcons", "label labelAr imageUrl category")
      .limit(15)
      .lean();

    // Attach min room price for each hotel
    const hotelIds = hotels.map((h) => h._id);
    const priceAgg = await Room.aggregate([
      { $match: { hotelId: { $in: hotelIds }, status: "available" } },
      {
        $group: {
          _id: "$hotelId",
          minPrice: { $min: "$pricePerNight" },
          currency: { $first: "$currency" },
          roomCount: { $sum: 1 },
        },
      },
    ]);
    const priceMap = {};
    priceAgg.forEach((p) => { priceMap[p._id.toString()] = p; });

    const result = hotels.map((h) => {
      const pm = priceMap[h._id.toString()];
      return {
        ...h,
        startingPrice: pm ? pm.minPrice : null,
        currency: pm ? pm.currency : "USD",
        availableRooms: pm ? pm.roomCount : 0,
      };
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/public/hotels/:id
 * Public. Returns a single hotel with full details.
 */
exports.getHotelDetails = async (req, res, next) => {
  try {
    const hotel = await Hotel.findById(req.params.id)
      .select("name city country stars thumbnail location description selectedIcons")
      .populate("selectedIcons")
      .lean();
    if (!hotel) return res.status(404).json({ message: "Hotel not found" });
    res.json(hotel);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/public/hotels/:id/rooms
 * Public. Returns available rooms for a hotel.
 */
exports.getHotelRooms = async (req, res, next) => {
  try {
    const { id } = req.params;
    const rooms = await Room.find({ hotelId: id, status: "available" })
      .select("number name type category capacity beds bedType pricePerNight currency discount sizeM2 view amenities thumbnail images description smokingAllowed petsAllowed")
      .lean();

    res.json(rooms);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/public/hotels/by-location?country=...&city=...
 * Public. Returns hotels filtered by country and/or city + icons + starting price.
 */
exports.getHotelsByLocation = async (req, res, next) => {
  try {
    const { country, city } = req.query;
    const filter = {};
    if (country) filter.country = new RegExp(`^${country}$`, "i");
    if (city) filter.city = new RegExp(`^${city}$`, "i");
    if (!country && !city) return res.json([]);

    const hotels = await Hotel.find(filter)
      .select("name city country stars thumbnail location description selectedIcons")
      .populate("selectedIcons", "label labelAr imageUrl category")
      .lean();

    const hotelIds = hotels.map((h) => h._id);
    const priceAgg = await Room.aggregate([
      { $match: { hotelId: { $in: hotelIds }, status: "available" } },
      {
        $group: {
          _id: "$hotelId",
          minPrice: { $min: "$pricePerNight" },
          currency: { $first: "$currency" },
          roomCount: { $sum: 1 },
        },
      },
    ]);
    const priceMap = {};
    priceAgg.forEach((p) => { priceMap[p._id.toString()] = p; });

    const result = hotels.map((h) => {
      const pm = priceMap[h._id.toString()];
      return {
        ...h,
        startingPrice: pm ? pm.minPrice : null,
        currency: pm ? pm.currency : "USD",
        availableRooms: pm ? pm.roomCount : 0,
      };
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/public/bookings
 * Public. Creates a booking from the public website.
 */
exports.createPublicBooking = async (req, res, next) => {
  try {
    const {
      hotelId, roomId, customerName, customerEmail, customerPhone,
      checkIn, checkOut, adultsCount, childrenCount, nationality,
      specialRequests, roomCount,
    } = req.body;

    if (!hotelId || !roomId || !customerName || !checkIn || !checkOut) {
      return res.status(400).json({ message: "Missing required fields: hotelId, roomId, customerName, checkIn, checkOut" });
    }

    // Validate hotel & room exist
    const hotel = await Hotel.findById(hotelId).lean();
    if (!hotel) return res.status(404).json({ message: "Hotel not found" });

    const room = await Room.findById(roomId).lean();
    if (!room) return res.status(404).json({ message: "Room not found" });

    // Calculate pricing
    const ci = new Date(checkIn);
    const co = new Date(checkOut);
    const nights = Math.max(1, Math.round((co - ci) / (1000 * 60 * 60 * 24)));
    const rooms = Math.max(1, Number(roomCount) || 1);
    const basePrice = room.pricePerNight || 0;
    const discountPct = room.discount || 0;
    const priceAfterDiscount = basePrice * (1 - discountPct / 100);
    const total = priceAfterDiscount * nights * rooms;

    // Generate unique reference
    const prefix = "TRV";
    const ts = Date.now().toString(36).toUpperCase();
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    const reference = `${prefix}-${ts}-${rand}`;

    const booking = await Booking.create({
      reference,
      bookingType: "hotel",
      customerName,
      customerEmail: customerEmail || undefined,
      customerPhone: customerPhone || undefined,
      adultsCount: adultsCount || 1,
      childrenCount: childrenCount || 0,
      nationality: nationality || undefined,
      specialRequests: specialRequests || undefined,
      bookingDate: new Date(),
      checkIn: ci,
      checkOut: co,
      nights,
      roomId: room._id,
      roomNumber: room.number || room.name,
      pricePerNight: basePrice,
      discount: discountPct,
      total,
      currency: room.currency || "USD",
      paymentStatus: "unpaid",
      status: "pending",
      hotelId: hotel._id,
      adminId: hotel.adminId,
      source: "online",
    });

    res.status(201).json({
      reference: booking.reference,
      bookingId: booking._id,
      hotelName: hotel.name,
      roomName: room.name || room.number,
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      nights,
      total: booking.total,
      currency: booking.currency,
      status: booking.status,
    });
  } catch (err) {
    next(err);
  }
};
