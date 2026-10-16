
const express = require("express");
const router = express.Router();
const prisma = require("../prismaClient");

const { statuses, validIntId, validUuid } =
  require("../utils/validation");

// CREATE PROJECT
router.post("/", async (req, res, next) => {
  try {
    const {
      projectname, description, status, userId, clientId,
    } = req.body;

    if (typeof projectname !== "string" || !projectname.trim()) {
      return res.status(400).json({
        message: "projectname is required",
      });
    }

    if (!validUuid(userId)) {
      return res.status(400).json({
        message: "userId must be a valid user UUID",
      });
    }

    const parsedClientId = validIntId(clientId);

    if (!parsedClientId) {
      return res.status(400).json({
        message: "clientId must be a positive integer",
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

    const [user, client] = await Promise.all([
      prisma.mytable.findUnique({ where: { id: userId } }),
      prisma.client.findUnique({
        where: { id: parsedClientId },
      }),
    ]);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    const project = await prisma.project.create({
      data: {
        projectname: projectname.trim(),
        description:
          typeof description === "string" && description.trim()
            ? description.trim()
            : null,
        status: status || "Pending",
        userId,
        clientId: parsedClientId,
      },
      include: { employee: true, client: true },
    });

    res.status(201).json({
      message: "Project created successfully",
      data: project,
    });
  } catch (error) {
    next(error);
  }
});

// GET ALL PROJECTS
router.get("/", async (req, res, next) => {
  try {
    const projects = await prisma.project.findMany({
      include: { employee: true, client: true },
      orderBy: { projectid: "desc" },
    });

    res.json({ count: projects.length, data: projects });
  } catch (error) {
    next(error);
  }
});

// GET PROJECT BY ID
router.get("/:id", async (req, res, next) => {
  try {
    const projectid = validIntId(req.params.id);

    if (!projectid) {
      return res.status(400).json({
        message: "Invalid project ID",
      });
    }

    const project = await prisma.project.findUnique({
      where: { projectid },
      include: { employee: true, client: true },
    });

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    res.json({ data: project });
  } catch (error) {
    next(error);
  }
});

// UPDATE PROJECT
router.put("/:id", async (req, res, next) => {
  try {
    const projectid = validIntId(req.params.id);

    if (!projectid) {
      return res.status(400).json({
        message: "Invalid project ID",
      });
    }

    const data = {};

    if (req.body.projectname !== undefined) {
      if (
        typeof req.body.projectname !== "string" ||
        !req.body.projectname.trim()
      ) {
        return res.status(400).json({
          message: "projectname must be a non-empty string",
        });
      }

      data.projectname = req.body.projectname.trim();
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

    if (req.body.clientId !== undefined) {
      const clientId = validIntId(req.body.clientId);

      if (!clientId) {
        return res.status(400).json({
          message: "Invalid clientId",
        });
      }

      const client = await prisma.client.findUnique({
        where: { id: clientId },
      });

      if (!client) {
        return res.status(404).json({
          message: "Client not found",
        });
      }

      data.clientId = clientId;
    }

    if (!Object.keys(data).length) {
      return res.status(400).json({
        message: "Provide at least one project field to update",
      });
    }

    const project = await prisma.project.update({
      where: { projectid },
      data,
      include: { employee: true, client: true },
    });

    res.json({
      message: "Project updated successfully",
      data: project,
    });
  } catch (error) {
    next(error);
  }
});

// DELETE PROJECT
router.delete("/:id", async (req, res, next) => {
  try {
    const projectid = validIntId(req.params.id);

    if (!projectid) {
      return res.status(400).json({
        message: "Invalid project ID",
      });
    }

    await prisma.project.delete({ where: { projectid } });

    res.json({ message: "Project deleted successfully" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
