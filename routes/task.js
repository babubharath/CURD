
const express = require("express");
const router = express.Router();
const prisma = require("../prismaClient");

const { statuses, validIntId, validUuid } =
  require("../utils/validation");

// CREATE TASK
router.post("/", async (req, res, next) => {
  try {
    const { taskname, description, status, userId } = req.body;

    if (typeof taskname !== "string" || !taskname.trim()) {
      return res.status(400).json({
        message: "taskname is required",
      });
    }

    if (!validUuid(userId)) {
      return res.status(400).json({
        message: "userId must be a valid user UUID",
      });
    }

    if (
      description != null &&
      typeof description !== "string"
    ) {
      return res.status(400).json({
        message: "description must be a string or null",
      });
    }

    if (status !== undefined && !statuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid status",
        allowedStatuses: statuses,
      });
    }

    const user = await prisma.mytable.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const task = await prisma.task.create({
      data: {
        taskname: taskname.trim(),
        description:
          typeof description === "string" && description.trim()
            ? description.trim()
            : null,
        status: status || "Pending",
        userId,
      },
      include: { employee: true },
    });

    res.status(201).json({
      message: "Task assigned successfully",
      data: task,
    });
  } catch (error) {
    next(error);
  }
});

// GET ALL TASKS
router.get("/", async (req, res, next) => {
  try {
    const tasks = await prisma.task.findMany({
      include: { employee: true },
      orderBy: { taskid: "desc" },
    });

    res.json({ count: tasks.length, data: tasks });
  } catch (error) {
    next(error);
  }
});

// GET TASK BY ID
router.get("/:id", async (req, res, next) => {
  try {
    const taskid = validIntId(req.params.id);

    if (!taskid) {
      return res.status(400).json({
        message: "Invalid task ID",
      });
    }

    const task = await prisma.task.findUnique({
      where: { taskid },
      include: { employee: true },
    });

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    res.json({ data: task });
  } catch (error) {
    next(error);
  }
});

// UPDATE TASK
router.put("/:id", async (req, res, next) => {
  try {
    const taskid = validIntId(req.params.id);

    if (!taskid) {
      return res.status(400).json({
        message: "Invalid task ID",
      });
    }

    const data = {};

    if (req.body.taskname !== undefined) {
      if (
        typeof req.body.taskname !== "string" ||
        !req.body.taskname.trim()
      ) {
        return res.status(400).json({
          message: "taskname must be a non-empty string",
        });
      }

      data.taskname = req.body.taskname.trim();
    }

    if (req.body.description !== undefined) {
      if (
        req.body.description !== null &&
        typeof req.body.description !== "string"
      ) {
        return res.status(400).json({
          message: "description must be a string or null",
        });
      }

      data.description =
        typeof req.body.description === "string" &&
        req.body.description.trim()
          ? req.body.description.trim()
          : null;
    }

    if (req.body.status !== undefined) {
      if (!statuses.includes(req.body.status)) {
        return res.status(400).json({
          message: "Invalid status",
          allowedStatuses: statuses,
        });
      }

      data.status = req.body.status;
    }

    if (req.body.userId !== undefined) {
      if (!validUuid(req.body.userId)) {
        return res.status(400).json({
          message: "Invalid userId UUID",
        });
      }

      const user = await prisma.mytable.findUnique({
        where: { id: req.body.userId },
      });

      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      data.userId = req.body.userId;
    }

    if (!Object.keys(data).length) {
      return res.status(400).json({
        message: "Provide at least one task field to update",
      });
    }

    const task = await prisma.task.update({
      where: { taskid },
      data,
      include: { employee: true },
    });

    res.json({
      message: "Task updated successfully",
      data: task,
    });
  } catch (error) {
    next(error);
  }
});

// DELETE TASK
router.delete("/:id", async (req, res, next) => {
  try {
    const taskid = validIntId(req.params.id);

    if (!taskid) {
      return res.status(400).json({
        message: "Invalid task ID",
      });
    }

    await prisma.task.delete({ where: { taskid } });

    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
