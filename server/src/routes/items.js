import { Router } from "express";
import mongoose from "mongoose";
import Item from "../models/Item.js";

const router = Router();

function isValidId(id) {
  return mongoose.isValidObjectId(id);
}

// GET /api/items?search=mouse&category=Accessories&lowStock=true
router.get("/", async (req, res, next) => {
  try {
    const { search = "", category = "", lowStock = "" } = req.query;
    const filter = {};

    if (search.trim()) {
      const safeSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(safeSearch, "i");
      filter.$or = [{ name: regex }, { sku: regex }, { category: regex }];
    }
    if (category.trim()) filter.category = category.trim();
    if (lowStock === "true") {
      filter.$expr = { $lte: ["$quantity", "$lowStockThreshold"] };
    }

    const items = await Item.find(filter).sort({ updatedAt: -1 });
    res.json({ items });
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ message: "Invalid item ID" });
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });
    res.json({ item });
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const item = await Item.create(req.body);
    res.status(201).json({ item });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: "That SKU already exists" });
    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({ message: error.message });
    }
    next(error);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ message: "Invalid item ID" });
    const item = await Item.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!item) return res.status(404).json({ message: "Item not found" });
    res.json({ item });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: "That SKU already exists" });
    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({ message: error.message });
    }
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ message: "Invalid item ID" });
    const item = await Item.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });
    res.json({ message: "Item deleted successfully" });
  } catch (error) {
    next(error);
  }
});

export default router;
