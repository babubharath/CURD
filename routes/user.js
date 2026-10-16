
const express = require("express");
const router = express.Router();
const prisma = require("../prismaClient");

const {
  validUuid,
  validateTextFields,
} = require("../utils/validation");

// CREATE USER
router.post("/", async (req, res, next) => {
  try {
    const error = validateTextFields(req.body, [
      "name", "phone", "email",
    ]);

    if (error) {
      return res.status(400).json({ message: error });
    }

    const user = await prisma.mytable.create({
      data: {
        name: req.body.name.trim(),
        phone: req.body.phone.trim(),
        email: req.body.email.trim(),
      },
    });

    res.status(201).json({
      message: "User created successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
});

// GET ALL USERS
router.get("/", async (req, res, next) => {
  try {
    const users = await prisma.mytable.findMany({
      orderBy: { name: "asc" },
    });

    res.json({ count: users.length, data: users });
  } catch (error) {
    next(error);
  }
});

// GET USER BY ID
router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!validUuid(id)) {
      return res.status(400).json({
        message: "Invalid user UUID",
      });
    }

    const user = await prisma.mytable.findUnique({
      where: { id },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json({ data: user });
  } catch (error) {
    next(error);
  }
});

// GET TASKS FOR A USER
router.get("/:id/tasks", async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!validUuid(id)) {
      return res.status(400).json({
        message: "Invalid user UUID",
      });
    }

    const user = await prisma.mytable.findUnique({
      where: { id },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const tasks = await prisma.task.findMany({
      where: { userId: id },
      orderBy: { taskid: "desc" },
    });

    res.json({ count: tasks.length, data: tasks });
  } catch (error) {
    next(error);
  }
});

// UPDATE USER
router.put("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!validUuid(id)) {
      return res.status(400).json({
        message: "Invalid user UUID",
      });
    }

    const data = {};

    for (const field of ["name", "phone", "email"]) {
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
        message: "Provide name, phone, or email to update",
      });
    }

    const user = await prisma.mytable.update({
      where: { id },
      data,
    });

    res.json({
      message: "User updated successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
});

// DELETE USER
router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!validUuid(id)) {
      return res.status(400).json({
        message: "Invalid user UUID",
      });
    }

    await prisma.mytable.delete({ where: { id } });

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
