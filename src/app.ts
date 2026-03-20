import express from "express";

const app = express();

// simple route
app.get("/health", (_req, res) => {
  res.send("OK");
});

app.get("/", (_req, res) => {
  res.send("API running 🚀");
});

export default app;