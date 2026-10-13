
const express = require("express");
const { Pool } = require("pg");
require("dotenv").config();

const app = express();
app.use(express.json());


const con = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT)
});

con.connect()
    .then(client => {
        console.log("Connected to PostgreSQL");
        client.release();
    })
    .catch(err => console.error("Database connection error:", err.message));


app.post("/user", async (req, res, next) => {
    try {
        const { name, mark } = req.body;

        if (!name || (mark != null && !Number.isInteger(mark))) {
            return res.status(400).json({
                message: "Valid name and integer mark are required"
            });
        }

        const result = await con.query(
            "INSERT INTO mytable (name, mark) VALUES ($1, $2) RETURNING *",
            [name, mark ?? null]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        next(err);
    }
});


app.get("/user", async (req, res, next) => {
    try {
        const result = await con.query(
            "SELECT * FROM mytable ORDER BY id"
        );
        res.json(result.rows);
    } catch (err) {
        next(err);
    }
});


app.get("/user/:id", async (req, res, next) => {
    try {
        const id = req.params.id;

        if (!/^[1-9]\d*$/.test(id)) {
            return res.status(400).json({ message: "Invalid user ID" });
        }

        const result = await con.query(
            "SELECT * FROM mytable WHERE id = $1",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(result.rows[0]);
    } catch (err) {
        next(err);
    }
});


app.put("/user/:id", async (req, res, next) => {
    try {
        const id = req.params.id;
        const { name, mark } = req.body;

        if (!/^[1-9]\d*$/.test(id)) {
            return res.status(400).json({ message: "Invalid user ID" });
        }

        if (!name || (mark != null && !Number.isInteger(mark))) {
            return res.status(400).json({
                message: "Valid name and integer mark are required"
            });
        }

        const result = await con.query(
            "UPDATE mytable SET name = $1, mark = $2 WHERE id = $3 RETURNING *",
            [name, mark ?? null, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(result.rows[0]);
    } catch (err) {
        next(err);
    }
});


app.patch("/user/mark/:id", async (req, res, next) => {
    try {
        const id = req.params.id;
        const { mark } = req.body;

        if (!/^[1-9]\d*$/.test(id)) {
            return res.status(400).json({ message: "Invalid user ID" });
        }

        if (!Number.isInteger(mark)) {
            return res.status(400).json({
                message: "Mark must be an integer"
            });
        }

        const result = await con.query(
            "UPDATE mytable SET mark = $1 WHERE id = $2 RETURNING *",
            [mark, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(result.rows[0]);
    } catch (err) {
        next(err);
    }
});


app.delete("/user/:id", async (req, res, next) => {
    try {
        const id = req.params.id;

        if (!/^[1-9]\d*$/.test(id)) {
            return res.status(400).json({ message: "Invalid user ID" });
        }

        const result = await con.query(
            "DELETE FROM mytable WHERE id = $1 RETURNING *",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({ message: "User deleted successfully" });
    } catch (err) {
        next(err);
    }
});


app.post("/client", async (req, res, next) => {
    try {
        const { clientname } = req.body;

        if (!clientname) {
            return res.status(400).json({
                message: "Client name is required"
            });
        }

        const result = await con.query(
            'INSERT INTO "Client" (clientname) VALUES ($1) RETURNING *',
            [clientname]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        next(err);
    }
});


app.get("/client", async (req, res, next) => {
    try {
        const result = await con.query(
            'SELECT * FROM "Client" ORDER BY clientname'
        );
        res.json(result.rows);
    } catch (err) {
        next(err);
    }
});


app.get("/client/:clientid", async (req, res, next) => {
    try {
        const clientid = req.params.clientid;

        if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(clientid)) {
            return res.status(400).json({ message: "Invalid client UUID" });
        }

        const result = await con.query(
            'SELECT * FROM "Client" WHERE clientid = $1',
            [clientid]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Client not found" });
        }

        res.json(result.rows[0]);
    } catch (err) {
        next(err);
    }
});


app.put("/client/:clientid", async (req, res, next) => {
    try {
        const clientid = req.params.clientid;
        const { clientname } = req.body;

        if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(clientid)) {
            return res.status(400).json({ message: "Invalid client UUID" });
        }

        if (!clientname) {
            return res.status(400).json({
                message: "Client name is required"
            });
        }

        const result = await con.query(
            'UPDATE "Client" SET clientname = $1 WHERE clientid = $2 RETURNING *',
            [clientname, clientid]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Client not found" });
        }

        res.json(result.rows[0]);
    } catch (err) {
        next(err);
    }
});


app.delete("/client/:clientid", async (req, res, next) => {
    try {
        const clientid = req.params.clientid;

        if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(clientid)) {
            return res.status(400).json({ message: "Invalid client UUID" });
        }

        const result = await con.query(
            'DELETE FROM "Client" WHERE clientid = $1 RETURNING *',
            [clientid]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Client not found" });
        }

        res.json({ message: "Client deleted successfully" });
    } catch (err) {
        next(err);
    }
});



app.use((req, res) => {
    res.status(404).json({ message: "API route not found" });
});

app.use((err, req, res, next) => {
    console.error(err.message);

    if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
        return res.status(400).json({ message: "Invalid JSON body" });
    }

    res.status(500).json({ message: "Internal server error" });
});



app.listen(3000, () => {
    console.log("Server is running on port 3000");
});
