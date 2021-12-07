const express = require('express');
const router = express.Router();
const Category = require('../models/category');

router.get('/', async (req, res) => {
  const catedories = await Category.find();
  if (!catedories) {
    res.status(500).json({success: false});
  }
  res.status(200).send(catedories);
});

router.post('/', async (req, res) => {
  let category = new Category({
    name: req.body.name,
    icon: req.body.icon,
    color: req.body.color,
  });

  try {
    await category.save();
    res.send(category);
  } catch (e) {
    res.status(500).json({error: e});
  }
});

router.get('/:id', async (req, res) => {
  const id = req.params.id;
  const category = await Category.findById(id);

  if (!category) {
    return res.status(400).json({success: false, message: 'Not find Category'});
  }

  res.status(200).send(category);
});

router.put('/:id', async (req, res) => {
  const id = req.params.id;
  const body = {
    name: req.body.name,
    icon: req.body.icon,
    color: req.body.color,
  };
  const category = await Category.findByIdAndUpdate(id, body, {new: true});

  if (!category) {
    return res.status(400).json({success: false, message: 'Not find Category'});
  }

  res.status(200).send(category);
});

router.delete('/:id', async (req, res) => {
  const id = req.params.id;

  try {
    let category = await Category.findByIdAndRemove(id);
    if (!category) {
      return res
        .status(404)
        .json({success: false, message: 'Not find Category'});
    }
    res.status(200).json({success: true, message: 'Deleted Category'});
  } catch (e) {
    res.status(400).json({success: false, error: e});
  }
});

module.exports = router;
