const productModel = require("../models/productModel");

const filterProducts = (query) => {
  const products = productModel.getAllProducts();

  return products.filter((p) =>
    p.name.toLowerCase().includes(query.toLowerCase())
  );
};

module.exports = {
  filterProducts,
};