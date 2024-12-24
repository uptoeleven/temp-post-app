const Material = require("../models/materialModel");
const mongoose = require("mongoose");
const validator = require("validator");
const validateAndSanitizeMaterial = require("../middleware/validateMaterial");

// Get all documents
const getMaterials = async (req, res) => {
  const user_id = req.user._id;
  const materials = await Material.find({ user_id }).sort({ createdAt: -1 });
  res.status(200).json(materials);
};

// Get a single document
const getMaterial = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "Document not found" });
  }

  const material = await Material.findById(id);

  if (!material) {
    return res.status(404).json({ error: "Document not found" });
  }

  res.status(200).json(material);
};

// Create a new document
const createMaterial = [
  validateAndSanitizeMaterial,
  async (req, res) => {
    const { title, content, tags } = req.body;

    let emptyFields = [];
    if (!title) emptyFields.push("title");
    if (!content) emptyFields.push("content");
    if (!tags) emptyFields.push("tags");

    if (emptyFields.length > 0) {
      return res.status(400).json({
        error: "Please complete all boxes.",
        emptyFields,
      });
    }

    try {
      const user_id = req.user._id;
      const material = await Material.create({ title, content, tags, user_id });
      res.status(200).json(material);
    } catch (error) {
      console.error("[ERROR] Failed to create material:", error.message);
      res.status(400).json({ error: error.message });
    }
  },
];

// Delete a single document
const deleteMaterial = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "Document not found" });
  }

  const material = await Material.findOneAndDelete({ _id: id });

  if (!material) {
    return res.status(400).json({ error: "Document not found" });
  }

  res.status(200).json(material);
};

// Update a single document
const updateMaterial = [
  validateAndSanitizeMaterial,
  async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.error("[ERROR] Invalid material ID:", id);
      return res.status(404).json({ error: "Document not found" });
    }

    const { title, content, tags } = req.body;

    let emptyFields = [];
    if (!title) emptyFields.push("title");
    if (!content) emptyFields.push("content");
    if (!tags) emptyFields.push("tags");

    if (emptyFields.length > 0) {
      console.error("[ERROR] Empty fields in update request:", emptyFields);
      return res.status(400).json({
        error: "Please complete all boxes.",
        emptyFields,
      });
    }

    // Sanitize tags individually
    if (Array.isArray(tags)) {
      req.body.tags = tags.map((tag) => {
        if (typeof tag === "string") {
          const sanitizedTag = validator.escape(validator.trim(tag));
          return sanitizedTag;
        } else {
          return "";
        }
      });
    } else {
      console.error("[ERROR] Tags field is not an array.");
      return res
        .status(400)
        .json({ error: "Tags must be an array of strings." });
    }

    try {
      const material = await Material.findOneAndUpdate({ _id: id }, req.body, {
        new: true,
        runValidators: true,
      });

      if (!material) {
        return res.status(400).json({ error: "Document not found" });
      }

      res.status(200).json(material);
    } catch (error) {
      console.error("[ERROR] Failed to update material:", error.message);
      res.status(400).json({ error: error.message });
    }
  },
];

module.exports = {
  getMaterials,
  getMaterial,
  createMaterial,
  deleteMaterial,
  updateMaterial,
};
