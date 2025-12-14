import express from "express";

const app = express();

app.get("/demo", async (req, res) => {
  res.send("shubham");
});

export default app;
