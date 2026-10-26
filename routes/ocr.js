
const express = require("express");
const multer = require("multer");
const { createWorker } = require("tesseract.js");
const prisma = require("../prismaClient");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      return callback(
        new Error("Only JPG, PNG, and WEBP images are allowed")
      );
    }

    callback(null, true);
  },
});

// UPLOAD IMAGE, EXTRACT TEXT, AND SAVE
router.post("/", upload.single("image"), async (req, res, next) => {
  let worker;

  try {
    if (!req.file) {
      return res.status(400).json({
        message: "Please upload an image using the image field",
      });
    }

    worker = await createWorker("eng");

    const result = await worker.recognize(req.file.buffer);
    const extractedText = result.data.text.trim();

    const document = await prisma.ocrDocument.create({
      data: {
        fileName: req.file.originalname,
        extractedText,
      },
    });

    res.status(201).json({
      message: "OCR completed and document saved",
      data: document,
    });
  } catch (error) {
    next(error);
  } finally {
    if (worker) {
      await worker.terminate();
    }
  }
});

// SEARCH EXTRACTED TEXT AND FILE NAME
router.get("/search", async (req, res, next) => {
  try {
    const searchText = req.query.text;

    if (
      typeof searchText !== "string" ||
      !searchText.trim()
    ) {
      return res.status(400).json({
        message: "Provide a search term using ?text=",
      });
    }

    const documents = await prisma.ocrDocument.findMany({
      where: {
        OR: [
          {
            fileName: {
              contains: searchText.trim(),
              mode: "insensitive",
            },
          },
          {
            extractedText: {
              contains: searchText.trim(),
              mode: "insensitive",
            },
          },
        ],
      },
      select: {
        id: true,
        fileName: true,
        extractedText: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json({
      searchText: searchText.trim(),
      count: documents.length,
      data: documents,
    });
  } catch (error) {
    next(error);
  }
});

// GET ALL OCR DOCUMENTS
router.get("/", async (req, res, next) => {
  try {
    const documents = await prisma.ocrDocument.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        fileName: true,
        extractedText: true,
        createdAt: true,
      },
    });

    res.json({
      count: documents.length,
      data: documents,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
