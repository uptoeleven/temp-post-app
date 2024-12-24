const express = require("express");

const {
  createMaterial,
  getMaterials,
  getMaterial,
  deleteMaterial,
  updateMaterial,
} = require("../controllers/materialController");

const requireAuth = require("../middleware/requireAuth");

const router = express.Router();

router.use(requireAuth);

// GET all documents
router.get("/", getMaterials);

// GET a single document
router.get("/:id", getMaterial);

// POST a new document
router.post("/", createMaterial);

// DELETE a single document
router.delete("/:id", deleteMaterial);

// UPDATE a single document
router.patch("/:id", updateMaterial);

module.exports = router;
