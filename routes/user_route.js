const User = require('../models/user');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {checkId} = require('../db');

router.get('/', async (req, res) => {
  const users = await User.find().select('-passwordHash');
  if (!users) {
    res.status(500).json({success: false, message: 'No find Users'});
  }

  res.send(users);
});
router.get('/:id', async (req, res) => {
  const id = req.params.id;
  const user = await User.findById(id).select('-passwordHash');

  if (!user)
    return res.status(500).json({success: false, message: 'No find User'});

  res.status(200).send(user);
});

router.post('/register', async (req, res) => {
  const body = req.body;
  const email = body.email;

  const userFound = await User.findOne({email: email});
  if (userFound)
    return res
      .status(400)
      .json({success: false, message: 'Already Email Exist'});

  const hashed = await bcrypt.hash(body.password, 10);

  let user = new User({
    name: body.name,
    email: email,
    phone: body.phone,
    passwordHash: hashed,
    street: body.street,
    apartment: body.apartment,
    city: body.city,
    zip: body.zip,
    country: body.country,
    isAdmin: body.isAdmin,
  });

  user = await user.save();

  if (!user)
    return res.status(400).json({success: false, message: 'Can7y create user'});

  res.send(user);
});

router.delete('/:id', async (req, res) => {
  const id = req.params.id;
  if (!checkId(id)) return res.status(400).send('Invalid ID');

  try {
    let user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({success: false, message: 'Not find User'});
    }

    res.status(200).json({success: true, message: 'Deleted User'});
  } catch (e) {
    res.status(400).json({success: false, error: e});
  }
});

router.post('/login', async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = await User.findOne({email: email});
  if (!user)
    return res.status(400).json({success: false, message: 'No find User'});

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid)
    return res
      .status(400)
      .json({success: false, message: 'Password not match'});

  const secret = process.env.JWT_SECRET_KEY || 'mysecretkey';
  console.log(user.isAdmin);
  const payload = {userid: user.id, email: user.email, isAdmin: user.isAdmin};
  const token = jwt.sign(payload, secret, {expiresIn: '1d'});

  return res.status(200).json({email: user.email, token: token});
});

router.get('/get/count', async (req, res) => {
  const userCount = await User.countDocuments();

  if (!userCount)
    return res.status(500).json({status: false, message: 'No find Users'});

  res.send({count: userCount});
});

module.exports = router;
