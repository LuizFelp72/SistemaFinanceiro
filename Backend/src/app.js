const express = require("express");
const cors = require("cors");
require("dotenv").config();
const authenticate = require("./middlewares/auth.middleware");
const errorHandler = require("./middlewares/error.middleware");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "API funcionando",
  });
});

app.use("/api/v1/accounts", authenticate, require("./modules/accounts/account.routes"));
app.use("/api/v1/transactions", authenticate, require("./modules/transactions/transaction.routes"));
app.use((req, res) => res.status(404).json({ error: "Rota não encontrada." }));
app.use(errorHandler);

module.exports = app;
