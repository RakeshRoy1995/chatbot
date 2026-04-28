
import express from "express";
import app from "./src/app.js";
import path from "path";
const PORT = 3000;

app.set("view engine", "ejs");
app.set("views", path.join(process.cwd(), "src/views"));
app.use(express.static("src/public"));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});