import fs from "fs";

export const getProducts = (req, res) => {
  const products = JSON.parse(
    fs.readFileSync("./products.json", "utf-8")
  );

  res.json({
    success: true,
    data: products,
  });
};