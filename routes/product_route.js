const express = require('express');
const Category = require('../models/category');
const router = express.Router();
const Product = require('../models/product');
const {checkId} = require('../db');
const multer = require('multer');
const req = require('express/lib/request');
const FILE_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpeg',
  'image/jpg': 'jpg',
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const isValid = FILE_TYPE_MAP[file.mimetype];
    let uploadError = new Error('invalid Image TypeError');
    if (isValid) {
      uploadError = null;
    }
    cb(uploadError, 'public/uploads');
  },
  filename: function (req, file, cb) {
    const fileName = file.originalname.split(' ').join('-');
    const extension = FILE_TYPE_MAP[file.mimetype];
    cb(null, `${fileName}-${Date.now()}.${extension}`);
  },
});

const uploadOptions = multer({storage: storage});

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

router.post(`/`, uploadOptions.single('image'), async (req, res) => {
  const category = await Category.findById(req.body.category);
  if (!category) {
    return res.status(400).json({
      error: 'Invalid Category id',
      success: false,
    });
  }

  const file = req.file;
  if (!file)
    return res.status(400).json({
      error: 'no exist File',
      success: false,
    });

  const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
  const filename = req.file.filename;
  const imagePath = `${basePath}${filename}`;

  console.log(imagePath);
  const product = new Product({
    name: req.body.name,
    description: req.body.description,
    richDescription: req.body.richDescription,
    image: imagePath,
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

router.put('/:id', uploadOptions.single('image'), async (req, res) => {
  const id = req.params.id;
  if (!checkId(id)) return res.status(400).send('Invalid ID');
  const category = await Category.findById(req.body.category);
  if (!category) {
    return res.status(400).json({
      error: 'Invalid Category',
      success: false,
    });
  }
  const productFound = await Product.findById(id);
  if (!productFound) return res.status(400).send('Not find Product');

  const file = req.file;
  let imagePath;
  if (file) {
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
    const filename = req.file.filename;
    imagePath = `${basePath}${filename}`;
  } else {
    imagePath = productFound.image;
  }

  const body = {
    name: req.body.name,
    description: req.body.description,
    richDescription: req.body.richDescription,
    image: imagePath,
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

router.put(
  '/multiple-image/:id',
  uploadOptions.array('images', 10),
  async (req, res) => {
    const id = req.params.id;
    if (!checkId(id)) return res.status(400).send('Invalid ID');
    const files = req.files;
    let imagePaths = [];
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;

    files.map((file) => {
      const imagePath = `${basePath}${file.filename}`;
      imagePaths.push(imagePath);
    });

    if (!imagePaths.length)
      return res.status(400).json({
        error: 'no exist File',
        success: false,
      });

    const body = {
      images: imagePaths,
    };

    const product = await Product.findByIdAndUpdate(id, body, {new: true});

    if (!product) {
      return res.status(404).json({status: false, message: 'No find Product'});
    }

    return res.send(product);
  }
);

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
