/**
 * Dev-only seed: populates local MongoDB with sample hotels + rooms.
 * Run: node src/seed-dev-hotels.js
 */
require("dotenv").config({
  path: require("path").resolve(__dirname, "../.env.development"),
});

const mongoose = require("mongoose");
const Hotel = require("./models/Hotel");
const Room = require("./models/Room");

const HOTELS = [
  {
    name: "فندق الشام الكبير",
    location: "دمشق، سوريا",
    description: "فندق فاخر في قلب دمشق يوفر تجربة إقامة استثنائية مع إطلالات رائعة على المدينة القديمة.",
    country: "Syria",
    city: "Damascus",
    stars: 5,
    thumbnail: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
  },
  {
    name: "فندق حلب الدولي",
    location: "حلب، سوريا",
    description: "يقع في وسط مدينة حلب التاريخية، يجمع بين الأصالة والحداثة.",
    country: "Syria",
    city: "Aleppo",
    stars: 4,
    thumbnail: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800",
  },
  {
    name: "فندق لاتاكيا البحري",
    location: "اللاذقية، سوريا",
    description: "فندق ساحلي مطل على البحر المتوسط، مثالي للراحة والاسترخاء.",
    country: "Syria",
    city: "Latakia",
    stars: 4,
    thumbnail: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800",
  },
  {
    name: "نيل هيلتون القاهرة",
    location: "القاهرة، مصر",
    description: "فندق فاخر على ضفاف نهر النيل مع إطلالات خلابة على الأهرامات.",
    country: "Egypt",
    city: "Cairo",
    stars: 5,
    thumbnail: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800",
  },
  {
    name: "ريزورت شرم الشيخ",
    location: "شرم الشيخ، مصر",
    description: "منتجع فاخر على شاطئ البحر الأحمر، مثالي للغوص وممارسة الرياضات المائية.",
    country: "Egypt",
    city: "Sharm El Sheikh",
    stars: 5,
    thumbnail: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800",
  },
  {
    name: "فندق الأهرام الذهبي",
    location: "الجيزة، مصر",
    description: "إطلالة مباشرة على الأهرامات العظيمة من كل غرفة في الفندق.",
    country: "Egypt",
    city: "Giza",
    stars: 4,
    thumbnail: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800",
  },
  {
    name: "برج دبي الفندقي",
    location: "دبي، الإمارات",
    description: "فندق فاخر في قلب دبي مع إطلالات بانورامية على ناطحات السحاب.",
    country: "UAE",
    city: "Dubai",
    stars: 5,
    thumbnail: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800",
  },
  {
    name: "فندق بيروت المارينا",
    location: "بيروت، لبنان",
    description: "فندق راقٍ على الكورنيش البحري في بيروت، يجمع بين الحداثة والتراث.",
    country: "Lebanon",
    city: "Beirut",
    stars: 4,
    thumbnail: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800",
  },
];

const ROOM_TEMPLATES = [
  {
    number: "101",
    name: "غرفة ستاندرد",
    type: "room",
    category: "standard",
    capacity: 2,
    beds: 1,
    bedType: "double",
    pricePerNight: 80,
    currency: "USD",
    sizeM2: 25,
    view: "city",
    status: "available",
    amenities: { wifi: true, ac: true, tv: true },
    thumbnail: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600",
  },
  {
    number: "201",
    name: "غرفة ديلوكس",
    type: "room",
    category: "deluxe",
    capacity: 2,
    beds: 1,
    bedType: "king",
    pricePerNight: 140,
    currency: "USD",
    sizeM2: 35,
    view: "sea",
    status: "available",
    amenities: { wifi: true, ac: true, tv: true, minibar: true, safe: true },
    thumbnail: "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600",
  },
  {
    number: "301",
    name: "جناح سوبيريور",
    type: "suite",
    category: "superior",
    capacity: 3,
    beds: 2,
    bedType: "twin",
    pricePerNight: 220,
    currency: "USD",
    sizeM2: 55,
    view: "garden",
    status: "available",
    amenities: { wifi: true, ac: true, tv: true, minibar: true, safe: true, balcony: true },
    thumbnail: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=600",
  },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI, { dbName: "booking_platform" });
  console.log("Connected to local MongoDB");

  // Remove existing dev hotels (those without a manager/adminId)
  await Hotel.deleteMany({ adminId: { $exists: false } });
  await Room.deleteMany({ adminId: { $exists: false } });

  for (const hotelData of HOTELS) {
    const hotel = await Hotel.create(hotelData);
    console.log(`Created hotel: ${hotel.name}`);

    for (const roomTpl of ROOM_TEMPLATES) {
      await Room.create({ ...roomTpl, hotelId: hotel._id });
    }
  }

  console.log(`\nSeeded ${HOTELS.length} hotels with ${ROOM_TEMPLATES.length} rooms each.`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
