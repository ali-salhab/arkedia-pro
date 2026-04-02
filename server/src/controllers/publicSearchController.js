const mongoose = require("mongoose");
const Hotel = require("../models/Hotel");
const Room = require("../models/Room");
const Booking = require("../models/Booking");
const ChannelManagerConfig = require("../models/ChannelManagerConfig");

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
 * Maps a ChannelManagerConfig roomType object to the Room-like shape the client expects.
 */
function inferViewFromSupplement(name = "") {
  const normalized = String(name || "").toLowerCase();
  if (normalized.includes("sea")) return "sea";
  if (normalized.includes("pool")) return "pool";
  if (normalized.includes("garden")) return "garden";
  if (normalized.includes("mountain")) return "mountain";
  if (normalized.includes("city")) return "city";
  return "none";
}

function channelRoomToPublic(rt, channelConfig, supplement = null) {
  const groups = Array.isArray(channelConfig.guestGroups) ? channelConfig.guestGroups : [];
  const periods = Array.isArray(channelConfig.periods) ? channelConfig.periods : [];
  const meals = Array.isArray(channelConfig.mealPlans) ? channelConfig.mealPlans : [];
  const refunds = Array.isArray(channelConfig.refundPolicies) ? channelConfig.refundPolicies : [];

  let selectedGroupId = groups[0]?.id || null;
  let selectedPeriodId = periods[0]?.id || null;
  for (const p of periods) {
    for (const g of groups) {
      const val = Number(channelConfig?.dblPrices?.[p.id]?.[g.id] || 0);
      if (val > 0) {
        selectedPeriodId = p.id;
        selectedGroupId = g.id;
        break;
      }
    }
    if (Number(channelConfig?.dblPrices?.[selectedPeriodId]?.[selectedGroupId] || 0) > 0) {
      break;
    }
  }
  const base = Number(channelConfig?.dblPrices?.[selectedPeriodId]?.[selectedGroupId] || 0);

  let roomAdj = 0;
  if (!rt.isBase) {
    const formula = rt.priceFormula || "add";
    const method = rt.priceMethod || "percentage";
    if (formula === "add") {
      roomAdj = method === "fixed"
        ? Number(rt?.priceDiffs?.[selectedPeriodId]?.[selectedGroupId] || 0)
        : (base * Number(rt.pricePercent || 0)) / 100;
    } else {
      roomAdj = method === "fixed"
        ? -Number(rt?.priceDiffs?.[selectedPeriodId]?.[selectedGroupId] || 0)
        : -(base * Number(rt.pricePercent || 0)) / 100;
    }
  }

  const supplementAdj = Number(supplement?.prices?.[selectedGroupId] || 0);
  const roomBaseRate = Math.max(0, Math.round(base + roomAdj + supplementAdj));

  const mealRows = meals.length ? meals : [{ id: "bb", name: "Bed & Breakfast", code: "BB", prices: {} }];
  const refundRows = refunds.length ? refunds : [{ id: "free", name: "Free", type: "free", extraPrices: {} }];
  const rateOptions = mealRows.flatMap((mp) =>
    refundRows.map((rp) => {
      const mealAdj = Number(mp?.prices?.[selectedGroupId] || 0);
      const refundAdj = Number(rp?.extraPrices?.[selectedGroupId] || 0);
      const totalRate = Math.max(0, Math.round(roomBaseRate + mealAdj + refundAdj));
      return {
        id: `${supplement?.id || "base"}-${mp.id || "mp"}-${rp.id || "rp"}`,
        title: `${mp.name || "Bed & Breakfast"} & ${rp.name || "Free"}`,
        subtitle: `• ${mp.name || "Bed & Breakfast"} (${mp.code || "BB"})`,
        policyLabel: rp.name || "Free",
        policyType: rp.type || "free",
        pricePerNight: totalRate,
        currency: groups.find((g) => g.id === selectedGroupId)?.currency || channelConfig.defaultCurrency || "USD",
      };
    }),
  );
  const pricePerNight = rateOptions.length
    ? Math.min(...rateOptions.map((o) => Number(o.pricePerNight || 0)))
    : roomBaseRate;

  const capacity = rt.capacityOptions?.[0]?.adults ?? 2;
  const beds = rt.bedOptionSets?.[0]
    ? Object.values(rt.bedOptionSets[0]).reduce((s, v) => s + (typeof v === "number" ? v : 0), 0)
    : 1;

  const amenitiesObj = {};
  const AMENITY_KEY_MAP = {
    "تكييف هواء": "ac", "إنترنت واي فاي": "wifi", "تلفاز": "tv",
    "مني بار": "minibar", "خزنة": "safe", "شرفة": "balcony",
    "مجفف شعر": "hairDryer", "مكواة": "ironing", "ماكينة قهوة": "coffeeMaker",
    "حوض استحمام": "bathtub", "دش": "shower", "إفطار مجاني": "breakfast",
    "مطبخ صغير": "kitchenette",
  };
  (rt.amenities || []).forEach((label) => {
    const key = AMENITY_KEY_MAP[label];
    if (key) amenitiesObj[key] = true;
  });

  const baseName = rt.nameAr || rt.nameEn || rt.code;
  const fullName = supplement?.name ? `${supplement.name} - ${baseName}` : baseName;

  return {
    _id: supplement?.id ? `${rt.id}__${supplement.id}` : rt.id,
    bookableRoomId: rt.id,
    supplementId: supplement?.id || null,
    supplementName: supplement?.name || "",
    number: rt.code || rt.id,
    name: fullName,
    type: "room",
    category: rt.category || "standard",
    capacity,
    beds,
    bedType: "double",
    pricePerNight,
    currency: rateOptions[0]?.currency || channelConfig.defaultCurrency || "USD",
    discount: 0,
    thumbnail: rt.mainImage || null,
    images: rt.gallery && rt.gallery.length ? rt.gallery : rt.mainImage ? [rt.mainImage] : [],
    description: rt.descAr || rt.descEn || "",
    amenities: amenitiesObj,
    smokingAllowed: false,
    petsAllowed: false,
    view: inferViewFromSupplement(supplement?.name),
    roomType: rt.roomType,
    nameEn: rt.nameEn,
    nameAr: rt.nameAr,
    _source: "channel",
    rateOptions,
  };
}

/**
 * GET /api/public/hotels/:id/rooms
 * Public. Returns available rooms for a hotel.
 * Falls back to ChannelManagerConfig.roomTypes when no Room documents are found.
 */
exports.getHotelRooms = async (req, res, next) => {
  try {
    const { id } = req.params;
    const rooms = await Room.find({ hotelId: id, status: "available" })
      .select("number name type category capacity beds bedType pricePerNight currency discount sizeM2 view amenities thumbnail images description smokingAllowed petsAllowed")
      .lean();

    const hotel = await Hotel.findById(id).select("manager adminId").lean();
    if (!hotel) return res.json(rooms);

    const ownerId = hotel.manager || hotel.adminId;
    if (ownerId) {
      const channelConfig = await ChannelManagerConfig.findOne({ adminId: ownerId }).lean();

      if (channelConfig?.roomTypes?.length) {
        const visibleRoomTypes = (channelConfig.roomTypes || []).filter((rt) => !rt?.isHidden);
        const visibleSupplements = Array.isArray(channelConfig.supplements)
          ? channelConfig.supplements.filter((supp) => !supp?.isHidden)
          : [];

        const mapped = visibleRoomTypes.flatMap((rt) => [
          channelRoomToPublic(rt, channelConfig),
          ...visibleSupplements.map((supp) => channelRoomToPublic(rt, channelConfig, supp)),
        ]);

        if (mapped.length > 0) {
          return res.json(mapped);
        }
      }
    }

    return res.json(rooms);
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

    let room = mongoose.isValidObjectId(roomId) ? await Room.findById(roomId).lean() : null;
    let fallbackRoom = null;

    if (!room) {
      const ownerId = hotel.manager || hotel.adminId;
      if (ownerId) {
        const channelConfig = await ChannelManagerConfig.findOne({ adminId: ownerId }).lean();
        if (channelConfig?.roomTypes?.length) {
          const [baseRoomId, supplementId] = String(roomId).split("__");
          const roomType = channelConfig.roomTypes.find((item) => String(item.id) === String(baseRoomId));
          const supplement = supplementId
            ? (Array.isArray(channelConfig.supplements)
                ? channelConfig.supplements.find((item) => String(item.id) === String(supplementId))
                : null)
            : null;

          if (roomType) {
            fallbackRoom = channelRoomToPublic(roomType, channelConfig, supplement);
          }
        }
      }
    }

    if (!room && !fallbackRoom) {
      return res.status(404).json({ message: "Room not found" });
    }

    const pricingSource = room || fallbackRoom;

    // Calculate pricing
    const ci = new Date(checkIn);
    const co = new Date(checkOut);
    const nights = Math.max(1, Math.round((co - ci) / (1000 * 60 * 60 * 24)));
    const rooms = Math.max(1, Number(roomCount) || 1);
    const basePrice = pricingSource.pricePerNight || 0;
    const discountPct = room?.discount || 0;
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
      roomId: room?._id || undefined,
      roomNumber: room?.number || room?.name || fallbackRoom?.name || fallbackRoom?.number,
      pricePerNight: basePrice,
      discount: discountPct,
      total,
      currency: pricingSource.currency || "USD",
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
      roomName: room?.name || room?.number || fallbackRoom?.name || fallbackRoom?.number,
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
