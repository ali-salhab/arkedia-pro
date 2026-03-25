const ExcelJS = require("exceljs");
const multer = require("multer");
const asyncHandler = require("../middleware/asyncHandler");

// ─── Multer: in-memory, only .xlsx ───────────────────────────────────────────
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      file.originalname.endsWith(".xlsx")
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only .xlsx files are accepted"), false);
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

// ─── Column Definitions per resource ─────────────────────────────────────────
const RESOURCE_COLUMNS = {
  rooms: [
    { key: "number", header: "Room Number", required: true, width: 15 },
    { key: "name", header: "Name", width: 20 },
    { key: "floor", header: "Floor", width: 10 },
    {
      key: "type",
      header: "Type (room/table/suite/studio/villa/service)",
      width: 35,
    },
    {
      key: "category",
      header: "Category (standard/deluxe/superior/executive/presidential)",
      width: 40,
    },
    { key: "capacity", header: "Capacity", width: 12 },
    { key: "beds", header: "Beds", width: 10 },
    {
      key: "bedType",
      header: "Bed Type (single/double/queen/king/twin/sofa)",
      width: 35,
    },
    { key: "bathrooms", header: "Bathrooms", width: 12 },
    { key: "pricePerNight", header: "Price Per Night", width: 16 },
    { key: "currency", header: "Currency (e.g. USD)", width: 18 },
    { key: "discount", header: "Discount %", width: 12 },
    { key: "sizeM2", header: "Size (m²)", width: 12 },
    {
      key: "view",
      header: "View (sea/pool/city/garden/mountain/none)",
      width: 32,
    },
    {
      key: "status",
      header: "Status (available/occupied/maintenance/reserved)",
      width: 38,
    },
    { key: "smokingAllowed", header: "Smoking Allowed (true/false)", width: 22 },
    { key: "petsAllowed", header: "Pets Allowed (true/false)", width: 22 },
    { key: "description", header: "Description", width: 40 },
  ],
  hotels: [
    { key: "name", header: "Hotel Name", required: true, width: 30 },
    { key: "location", header: "Location", width: 30 },
    { key: "description", header: "Description", width: 50 },
  ],
  restaurants: [
    { key: "name", header: "Restaurant Name", required: true, width: 30 },
    { key: "cuisine", header: "Cuisine", width: 25 },
    { key: "location", header: "Location", width: 30 },
  ],
  activities: [
    { key: "name", header: "Activity Name", required: true, width: 30 },
    { key: "category", header: "Category", width: 25 },
    { key: "location", header: "Location", width: 30 },
  ],
  users: [
    { key: "name", header: "Full Name", required: true, width: 25 },
    { key: "email", header: "Email", required: true, width: 30 },
    {
      key: "role",
      header:
        "Role (hotel/hoteluser/restaurant/restaurantuser/activity/activityuser/admin/adminuser)",
      width: 60,
    },
  ],
  admins: [
    { key: "name", header: "Full Name", required: true, width: 25 },
    { key: "email", header: "Email", required: true, width: 30 },
    {
      key: "role",
      header: "Role (admin/adminuser/hotel/restaurant/activity)",
      width: 50,
    },
  ],
};

// ─── Header style ─────────────────────────────────────────────────────────────
function applyHeaderStyle(worksheet, columns) {
  const headerRow = worksheet.getRow(1);
  columns.forEach((col, idx) => {
    const cell = headerRow.getCell(idx + 1);
    cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF2563EB" },
    };
    cell.alignment = { horizontal: "center", vertical: "middle" };
    cell.border = {
      bottom: { style: "thin", color: { argb: "FF1D4ED8" } },
    };
  });
  headerRow.height = 24;
}

// ─── Helper: get scoped filter ────────────────────────────────────────────────
const PLATFORM_ROLES = new Set(["super_admin", "superadminuser"]);
function getScopedFilter(user) {
  if (!user) return { _id: null };
  if (PLATFORM_ROLES.has(user.role)) return {};
  const id = user._id || user.sub;
  return { adminId: id };
}

// ─── Factory ──────────────────────────────────────────────────────────────────
function buildDataControllers(Model, resourceKey) {
  const columns = RESOURCE_COLUMNS[resourceKey] || [];

  // GET /export  → send all records as .xlsx
  const exportData = asyncHandler(async (req, res) => {
    const filter = getScopedFilter(req.user);
    const records = await Model.find(filter).lean();

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Arkedia Platform";
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet(
      resourceKey[0].toUpperCase() + resourceKey.slice(1)
    );
    worksheet.columns = columns.map((c) => ({
      header: c.header,
      key: c.key,
      width: c.width || 20,
    }));
    applyHeaderStyle(worksheet, columns);

    records.forEach((rec) => {
      const row = {};
      columns.forEach((col) => {
        let val = rec[col.key];
        if (val && typeof val === "object" && val.toString) val = val.toString();
        if (typeof val === "boolean") val = val ? "true" : "false";
        row[col.key] = val ?? "";
      });
      worksheet.addRow(row);
    });

    // Alternate row shading
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;
      row.eachCell((cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: rowNumber % 2 === 0 ? "FFF8FAFC" : "FFFFFFFF" },
        };
        cell.alignment = { vertical: "middle" };
      });
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${resourceKey}_export_${Date.now()}.xlsx"`
    );

    await workbook.xlsx.write(res);
    res.end();
  });

  // GET /template  → blank .xlsx with only the header row
  const downloadTemplate = asyncHandler(async (req, res) => {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Arkedia Platform";

    const worksheet = workbook.addWorksheet(
      "Template – " + resourceKey[0].toUpperCase() + resourceKey.slice(1)
    );
    worksheet.columns = columns.map((c) => ({
      header: c.header,
      key: c.key,
      width: c.width || 20,
    }));
    applyHeaderStyle(worksheet, columns);

    // Add a sample / hint row
    const sampleRow = {};
    columns.forEach((col) => {
      sampleRow[col.key] = col.required ? "(required)" : "(optional)";
    });
    const row = worksheet.addRow(sampleRow);
    row.eachCell((cell) => {
      cell.font = { italic: true, color: { argb: "FF94A3B8" } };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFF1F5F9" },
      };
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${resourceKey}_template.xlsx"`
    );

    await workbook.xlsx.write(res);
    res.end();
  });

  // POST /import  → parse uploaded .xlsx and bulk-insert
  const importData = [
    upload.single("file"),
    asyncHandler(async (req, res) => {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(req.file.buffer);

      const worksheet = workbook.worksheets[0];
      if (!worksheet) {
        return res.status(400).json({ message: "Empty workbook" });
      }

      // Build header map: col letter / index → key
      const headerMap = {};
      const headerRow = worksheet.getRow(1);
      headerRow.eachCell((cell, colNumber) => {
        const headerText = String(cell.value || "").trim();
        const matchedCol = columns.find((c) => c.header === headerText);
        if (matchedCol) headerMap[colNumber] = matchedCol.key;
      });

      const records = [];
      const errors = [];

      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // skip header
        const obj = {};
        let hasData = false;

        row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
          const key = headerMap[colNumber];
          if (!key) return;
          let val = cell.value;
          if (val === null || val === undefined || val === "") return;
          val = String(val).trim();
          if (val === "(required)" || val === "(optional)") return;

          // Coerce booleans and numbers
          if (val.toLowerCase() === "true") val = true;
          else if (val.toLowerCase() === "false") val = false;
          else if (!isNaN(val) && val !== "") val = Number(val);

          obj[key] = val;
          hasData = true;
        });

        if (!hasData) return;

        // Validate required fields
        const missing = columns
          .filter((c) => c.required && !obj[c.key])
          .map((c) => c.key);
        if (missing.length > 0) {
          errors.push({
            row: rowNumber,
            message: `Missing required: ${missing.join(", ")}`,
          });
          return;
        }

        // Attach ownership
        const ownerId = req.user?._id || req.user?.sub;
        if (!PLATFORM_ROLES.has(req.user?.role) && ownerId) {
          obj.adminId = ownerId;
        }

        records.push(obj);
      });

      if (records.length === 0 && errors.length > 0) {
        return res.status(422).json({ message: "All rows had errors", errors });
      }

      const inserted = await Model.insertMany(records, { ordered: false }).catch(
        (err) => {
          if (err.insertedDocs) return err.insertedDocs;
          throw err;
        }
      );

      return res.status(201).json({
        imported: inserted.length,
        skipped: records.length - inserted.length,
        errors,
      });
    }),
  ];

  return { exportData, downloadTemplate, importData };
}

module.exports = { buildDataControllers };
