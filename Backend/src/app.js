const express = require("express");
const cors = require("cors");
require("dotenv").config();
const routes = require("./routes");
const errorHandler = require("./middlewares/error.middleware");

const app = express();

// A API fica atrás do nginx em produção/Docker.
app.set("trust proxy", 1);
app.use(cors());
app.use(express.json({ limit: "100kb" }));

app.get("/", (req, res) => res.json({ message: "API funcionando" }));
app.use("/api/v1", routes);
app.use((req, res) => res.status(404).json({ error: "Rota não encontrada." }));
app.use(errorHandler);

module.exports = app;
