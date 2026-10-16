
const express = require("express");
const router = express.Router();
const prisma = require("../prismaClient");

const {
  validIntId,
  validateTextFields,
} = require("../utils/validation");

// CREATE CLIENT
router.post("/", async (req, res, next) => {
  try {
    const error = validateTextFields(req.body, [
      "name", "companyname", "email", "phone",
    ]);

    if (error) {
      return res.status(400).json({ message: error });
    }

    const client = await prisma.client.create({
      data: {
        name: req.body.name.trim(),
        companyname: req.body.companyname.trim(),
        email: req.body.email.trim(),
        phone: req.body.phone.trim(),
      },
    });

    res.status(201).json({
      message: "Client created successfully",
      data: client,
    });
  } catch (error) {
    next(error);
  }
});

// GET ALL CLIENTS
router.get("/", async (req, res, next) => {
  try {
    const clients = await prisma.client.findMany({
      orderBy: { id: "desc" },
    });

    res.json({ count: clients.length, data: clients });
  } catch (error) {
    next(error);
  }
});

// GET CLIENT BY ID
router.get("/:id", async (req, res, next) => {
  try {
    const id = validIntId(req.params.id);

    if (!id) {
      return res.status(400).json({
        message: "Invalid client ID",
      });
    }

    const client = await prisma.client.findUnique({
      where: { id },
    });

    if (!client) {
      return res.status(404).json({
        message: "Client not found",
      });
    }

    res.json({ data: client });
  } catch (error) {
    next(error);
  }
});

// UPDATE CLIENT
router.put("/:id", async (req, res, next) => {
  try {
    const id = validIntId(req.params.id);

    if (!id) {
      return res.status(400).json({
        message: "Invalid client ID",
      });
    }

    const data = {};

    for (const field of [
      "name", "companyname", "email", "phone",
    ]) {
      if (req.body[field] !== undefined) {
        if (
          typeof req.body[field] !== "string" ||
          !req.body[field].trim()
        ) {
          return res.status(400).json({
            message: `${field} must be a non-empty string`,
          });
        }

        data[field] = req.body[field].trim();
      }
    }

    if (!Object.keys(data).length) {
      return res.status(400).json({
        message: "Provide at least one client field to update",
      });
    }

    const client = await prisma.client.update({
      where: { id },
      data,
    });

    res.json({
      message: "Client updated successfully",
      data: client,
    });
  } catch (error) {
    next(error);
  }
});

// DELETE CLIENT
router.delete("/:id", async (req, res, next) => {
  try {
    const id = validIntId(req.params.id);

    if (!id) {
      return res.status(400).json({
        message: "Invalid client ID",
      });
    }

    await prisma.client.delete({ where: { id } });

    res.json({ message: "Client deleted successfully" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
