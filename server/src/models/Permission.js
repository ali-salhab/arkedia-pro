const mongoose = require("mongoose");

const PermissionSchema = new mongoose.Schema(
  {
    module: { type: String, required: true },
    action: { type: String, required: true },
    code: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Permission", PermissionSchema);
