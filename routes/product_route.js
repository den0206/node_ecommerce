const express = require('express');
const Category = require('../models/category');
const router = express.Router();
const Product = require('../models/product');
const {checkId} = require('../db');

router.get(`/`, async (req, res) => {
  let filter = {};
  if (req.query.categories) {
    filter = {category: req.query.categories.split(',')};
  }
  const productList = await Product.find(filter)
    // .select('name description price -_id')
    .populate('category');

  if (!productList) {
    res.status(500).json({success: false});
  }
  res.send(productList);
});

router.get('/:id', async (req, res) => {
  const id = req.params.id;
  if (!checkId(id)) return res.status(400).send('Invalid ID');
  const product = await Product.findById(id).populate('category');
  if (!product) {
    return res.status(404).json({status: false, message: 'No find Product'});
  }

  return res.send(product);
});

router.delete('/:id', async (req, res) => {
  const id = req.params.id;
  if (!checkId(id)) return res.status(400).send('Invalid ID');

  try {
    let product = await Product.findByIdAndDelete(id);
    if (!product) {
      return res
        .status(404)
        .json({success: false, message: 'Not find Product'});
    }
    res.status(200).json({success: true, message: 'Deleted Product'});
  } catch (e) {
    res.status(400).json({success: false, error: e});
  }
});

router.post(`/`, async (req, res) => {
  const category = await Category.findById(req.body.category);
  if (!category) {
    return res.status(400).json({
      error: 'Invalid Category id',
      success: false,
    });
  }
  const product = new Product({
    name: req.body.name,
    description: req.body.description,
    richDescription: req.body.richDescription,
    image: req.body.image,
    price: req.body.price,
    category: req.body.category,
    countInStock: req.body.countInStock,
    rating: req.body.rating,
    isFeatured: req.body.isFeatured,
    countInStock: req.body.countInStock,
  });

  try {
    await product.save();
    res.status(201).send(product);
  } catch (e) {
    console.log(e);
    res.status(400).json({
      error: e,
      success: false,
    });
  }
});

router.put('/:id', async (req, res) => {
  const id = req.params.id;
  if (!checkId(id)) return res.status(400).send('Invalid ID');
  const category = await Category.findById(req.body.category);
  if (!category) {
    return res.status(400).json({
      error: 'Invalid Category',
      success: false,
    });
  }

  const body = {
    name: req.body.name,
    description: req.body.description,
    richDescription: req.body.richDescription,
    image: req.body.image,
    price: req.body.price,
    category: req.body.category,
    countInStock: req.body.countInStock,
    rating: req.body.rating,
    isFeatured: req.body.isFeatured,
    countInStock: req.body.countInStock,
  };
  const product = await Product.findByIdAndUpdate(id, body, {new: true});

  if (!product) {
    return res.status(404).json({status: false, message: 'No find Product'});
  }

  return res.send(product);
});

/// filters

router.get('/get/count', async (req, res) => {
  const productCount = await Product.countDocuments();

  if (!productCount) {
    return res.status(500).json({status: false, message: 'No find Product'});
  }

  res.send({count: productCount});
});

router.get(`/get/featured/:count`, async (req, res) => {
  const count = req.params.count ? req.params.count : 0;
  const featured = await Product.find({isFeatured: true}).limit(+count);

  if (!featured) {
    return res.status(500).json({status: false, message: 'No find featured'});
  }

  return res.send(featured);
});

module.exports = router;
