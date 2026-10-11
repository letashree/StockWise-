import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Item name is required"],
      trim: true,
      maxlength: [100, "Name must be 100 characters or fewer"]
    },
    sku: {
      type: String,
      required: [true, "SKU is required"],
      trim: true,
      uppercase: true,
      unique: true,
      maxlength: [40, "SKU must be 40 characters or fewer"]
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
      maxlength: [60, "Category must be 60 characters or fewer"]
    },
    quantity: {
      type: Number,
      required: true,
      min: [0, "Quantity cannot be negative"],
      validate: { validator: Number.isInteger, message: "Quantity must be a whole number" }
    },
    price: {
      type: Number,
      required: true,
      min: [0, "Price cannot be negative"]
    },
    lowStockThreshold: {
      type: Number,
      default: 5,
      min: [0, "Low-stock threshold cannot be negative"],
      validate: { validator: Number.isInteger, message: "Threshold must be a whole number" }
    }
  },
  { timestamps: true }
);

itemSchema.index({ name: "text", sku: "text", category: "text" });

export default mongoose.model("Item", itemSchema);
