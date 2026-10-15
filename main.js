
require("dotenv").config();

const express = require("express");
const prisma = require("./prismaClient");

const app = express();

app.use(express.json());

const statuses = ["Pending", "In Progress", "Completed", "On Hold"];

function validIntId(value) {
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

function validUuid(value) {
  return typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function validateTextFields(body, fields) {
  for (const field of fields) {
    if (
      typeof body[field] !== "string" ||
      body[field].trim().length === 0
    ) {
      return `${field} is required and must be a non-empty string`;
    }
  }
  return null;
}


app.post("/user", async (req, res, next) => {
  try {
    const error = validateTextFields(req.body, ["name", "phone", "email"]);
    if (error) return res.status(400).json({ message: error });

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

app.get("/user", async (req, res, next) => {
  try {
    const users = await prisma.mytable.findMany({
      orderBy: { name: "asc" },
    });

    res.json({ count: users.length, data: users });
  } catch (error) {
    next(error);
  }
});


app.get("/user/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!validUuid(id)) {
      return res.status(400).json({ message: "Invalid user UUID" });
    }

    const user = await prisma.mytable.findUnique({ where: { id } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ data: user });
  } catch (error) {
    next(error);
  }
});


app.put("/user/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!validUuid(id)) {
      return res.status(400).json({ message: "Invalid user UUID" });
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

app.delete("/user/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!validUuid(id)) {
      return res.status(400).json({ message: "Invalid user UUID" });
    }

    await prisma.mytable.delete({ where: { id } });

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    next(error);
  }
});


app.post("/client", async (req, res, next) => {
  try {
    const error = validateTextFields(req.body, [
      "name",
      "companyname",
      "email",
      "phone",
    ]);
    if (error) return res.status(400).json({ message: error });

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


app.get("/client", async (req, res, next) => {
  try {
    const clients = await prisma.client.findMany({
      orderBy: { id: "desc" },
    });

    res.json({ count: clients.length, data: clients });
  } catch (error) {
    next(error);
  }
});


app.get("/client/:id", async (req, res, next) => {
  try {
    const id = validIntId(req.params.id);
    if (!id) return res.status(400).json({ message: "Invalid client ID" });

    const client = await prisma.client.findUnique({ where: { id } });

    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    res.json({ data: client });
  } catch (error) {
    next(error);
  }
});


app.put("/client/:id", async (req, res, next) => {
  try {
    const id = validIntId(req.params.id);
    if (!id) return res.status(400).json({ message: "Invalid client ID" });

    const data = {};

    for (const field of ["name", "companyname", "email", "phone"]) {
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


app.delete("/client/:id", async (req, res, next) => {
  try {
    const id = validIntId(req.params.id);
    if (!id) return res.status(400).json({ message: "Invalid client ID" });

    await prisma.client.delete({ where: { id } });

    res.json({ message: "Client deleted successfully" });
  } catch (error) {
    next(error);
  }
});


app.post("/project", async (req, res, next) => {
  try {
    const { projectname, description, status, userId, clientId } = req.body;

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
      description !== undefined &&
      description !== null &&
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
      prisma.client.findUnique({ where: { id: parsedClientId } }),
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

app.get("/project", async (req, res, next) => {
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


app.get("/project/:id", async (req, res, next) => {
  try {
    const projectid = validIntId(req.params.id);
    if (!projectid) {
      return res.status(400).json({ message: "Invalid project ID" });
    }

    const project = await prisma.project.findUnique({
      where: { projectid },
      include: { employee: true, client: true },
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json({ data: project });
  } catch (error) {
    next(error);
  }
});

app.put("/project/:id", async (req, res, next) => {
  try {
    const projectid = validIntId(req.params.id);
    if (!projectid) {
      return res.status(400).json({ message: "Invalid project ID" });
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
        return res.status(400).json({ message: "Invalid userId UUID" });
      }

      const user = await prisma.mytable.findUnique({
        where: { id: req.body.userId },
      });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      data.userId = req.body.userId;
    }

    if (req.body.clientId !== undefined) {
      const clientId = validIntId(req.body.clientId);
      if (!clientId) {
        return res.status(400).json({ message: "Invalid clientId" });
      }

      const client = await prisma.client.findUnique({
        where: { id: clientId },
      });

      if (!client) {
        return res.status(404).json({ message: "Client not found" });
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


app.delete("/project/:id", async (req, res, next) => {
  try {
    const projectid = validIntId(req.params.id);
    if (!projectid) {
      return res.status(400).json({ message: "Invalid project ID" });
    }

    await prisma.project.delete({ where: { projectid } });

    res.json({ message: "Project deleted successfully" });
  } catch (error) {
    next(error);
  }
});



app.use((req, res) => {
  res.status(404).json({ message: "API route not found" });
});



app.use((error, req, res, next) => {
  console.error("API Error:", error);

  if (error.code === "P2002") {
    return res.status(409).json({
      message: "A unique value such as email or phone already exists",
    });
  }

  if (error.code === "P2003") {
    return res.status(400).json({
      message: "Foreign key constraint failed",
    });
  }

  if (error.code === "P2025") {
    return res.status(404).json({
      message: "Record not found",
    });
  }

  if (error.code === "P2023") {
    return res.status(400).json({
      message: "Invalid database ID format",
    });
  }

  res.status(500).json({
    message: "Internal server error",
  });
});



const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
