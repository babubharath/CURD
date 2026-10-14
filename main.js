
require("dotenv").config();

const express = require("express");
const prisma = require("./prismaClient");

const app = express();

app.use(express.json());


app.post("/user", async (req, res, next) => {
  try {
    const { name, mark } = req.body;

    const user = await prisma.mytable.create({
      data: { name, mark: Number(mark) }
    });

    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
});


app.get("/user", async (req, res, next) => {
  try {
    const users = await prisma.mytable.findMany();
    res.json(users);
  } catch (error) {
    next(error);
  }
});


app.get("/user/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const user = await prisma.mytable.findUnique({
      where: { id }
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
});


app.put("/user/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { name, mark } = req.body;

    if (!Number.isInteger(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const user = await prisma.mytable.update({
      where: { id },
      data: { name, mark: Number(mark) }
    });

    res.json(user);
  } catch (error) {
    next(error);
  }
});


app.patch("/user/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { mark } = req.body;

    if (!Number.isInteger(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const user = await prisma.mytable.update({
      where: { id },
      data: { mark: Number(mark) }
    });

    res.json(user);
  } catch (error) {
    next(error);
  }
});


app.delete("/user/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const user = await prisma.mytable.delete({
      where: { id }
    });

    res.json({
      message: "User deleted successfully",
      user
    });
  } catch (error) {
    next(error);
  }
});



app.post("/client", async (req, res, next) => {
  try {
    const { clientname } = req.body;

    const client = await prisma.client.create({
      data: { clientname }
    });

    res.status(201).json(client);
  } catch (error) {
    next(error);
  }
});


app.get("/client", async (req, res, next) => {
  try {
    const clients = await prisma.client.findMany();
    res.json(clients);
  } catch (error) {
    next(error);
  }
});


app.get("/client/:clientid", async (req, res, next) => {
  try {
    const { clientid } = req.params;

    const client = await prisma.client.findUnique({
      where: { clientid }
    });

    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    res.json(client);
  } catch (error) {
    next(error);
  }
});


app.put("/client/:clientid", async (req, res, next) => {
  try {
    const { clientid } = req.params;
    const { clientname } = req.body;

    const client = await prisma.client.update({
      where: { clientid },
      data: { clientname }
    });

    res.json(client);
  } catch (error) {
    next(error);
  }
});


app.delete("/client/:clientid", async (req, res, next) => {
  try {
    const { clientid } = req.params;

    const client = await prisma.client.delete({
      where: { clientid }
    });

    res.json({
      message: "Client deleted successfully",
      client
    });
  } catch (error) {
    next(error);
  }
});



app.use((req, res) => {
  res.status(404).json({ message: "API route not found" });
});



app.use((error, req, res, next) => {
  console.error(error);

  if (error.code === "P2025") {
    return res.status(404).json({ message: "Record not found" });
  }

  if (error.code === "P2002") {
    return res.status(409).json({ message: "Duplicate value" });
  }

  if (error.code === "P2023") {
    return res.status(400).json({ message: "Invalid ID format" });
  }

  res.status(500).json({ message: "Internal server error" });
});



const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
