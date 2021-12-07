const User = require('../models/user');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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

router.post('/', async (req, res) => {
  const body = req.body;

  const hashed = await bcrypt.hash(body.password, 10);
  console.log(hashed);

  let user = new User({
    name: body.name,
    email: body.email,
    phone: body.phone,
    passwordHash: hashed,
    street: body.street,
    apartment: body.apartment,
    city: body.city,
    zip: body.zip,
    country: body.country,
    iAdmin: body.iAdmin,
  });

  user = await user.save();

  if (!user)
    return res.status(400).json({success: false, message: 'Can7y create user'});

  res.send(user);
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
  const payload = {userid: user.id, email: user.email};
  const token = jwt.sign(payload, secret, {expiresIn: '1d'});

  return res.status(200).json({email: user.email, token: token});
});

module.exports = router;
