const express = require('express');
const router = express.Router();
const {checkId} = require('../db');
const Order = require('../models/order');
const OrderItem = require('../models/orderItem');

router.get('/', async (req, res) => {
  const orderList = await Order.find()
    .populate('user', 'name')
    .sort({daterOrder: -1});

  if (!orderList)
    return res.status(500).json({success: false, message: 'No Find Orders'});

  res.send(orderList);
});

router.get('/:id', async (req, res) => {
  const id = req.params.id;
  if (!checkId(id)) return res.status(400).send('Invalid ID');
  const order = await Order.findById(id)
    .populate('user', 'name')
    .populate({
      path: 'orderItems',
      populate: {path: 'product', populate: 'category'},
    });

  if (!order)
    return res.status(404).json({status: false, message: 'No find Order'});

  return res.send(order);
});

router.put('/status/:id', async (req, res) => {
  const id = req.params.id;
  if (!checkId(id)) return res.status(400).send('Invalid ID');

  const body = {status: req.body.status};
  const order = await Order.findByIdAndUpdate(id, body, {new: true});

  if (!order)
    return res.status(404).json({status: false, message: 'No find Order'});

  return res.send(order);

  r;
});

router.post('/', async (req, res) => {
  const orderItemsIds = await Promise.all(
    req.body.orderItems.map(async (orderItem) => {
      let newOrderItem = new OrderItem({
        quantity: orderItem.quantity,
        product: orderItem.product,
      });

      newOrderItem = await newOrderItem.save();

      return newOrderItem._id;
    })
  );
  const orderItemsResolvered = await orderItemsIds;
  const totalPrices = await Promise.all(
    orderItemsResolvered.map(async (itemId) => {
      const orderItem = await OrderItem.findById(itemId).populate(
        'product',
        'price'
      );
      const totalPrice = orderItem.product.price * orderItem.quantity;
      return totalPrice;
    })
  );

  const total = totalPrices.reduce((a, b) => a + b, 0);

  const order = new Order({
    orderItems: orderItemsResolvered,
    shippingAddress1: req.body.shippingAddress1,
    shippingAddress2: req.body.shippingAddress2,
    city: req.body.city,
    zip: req.body.zip,
    country: req.body.country,
    phone: req.body.phone,
    stauts: req.body.status,
    totalPrice: total,
    user: req.body.user,
  });

  try {
    await order.save();
    console.log(order);
    res.status(201).send(order);
  } catch (e) {
    console.log(e);
    res.status(400).json({
      error: e,
      success: false,
    });
  }
});

router.delete('/:id', async (req, res) => {
  const id = req.params.id;
  if (!checkId(id)) return res.status(400).send('Invalid ID');

  try {
    let order = await Order.findByIdAndDelete(id);
    if (!order) {
      return res.status(404).json({success: false, message: 'Not find Order'});
    }
    await order.orderItems.map(async (orderItem) => {
      console.log(orderItem);
      await OrderItem.findByIdAndDelete(orderItem);
    });
    res.status(200).json({success: true, message: 'Deleted Product'});
  } catch (e) {
    res.status(400).json({success: false, error: e});
  }
});

router.get('/get/count', async (req, res) => {
  const orderCount = await Order.countDocuments();
  if (!orderCount) {
    return res.status(500).json({status: false, message: 'No find Order'});
  }

  res.status(200).send({conut: orderCount});
});

router.get('/get/totalsales', async (req, res) => {
  const totalSales = await Order.aggregate([
    {$group: {_id: null, totalsales: {$sum: '$totalPrice'}}},
  ]);

  if (!totalSales)
    return res
      .status(404)
      .json({success: false, message: 'Not get Total Sales'});

  res.status(200).send({totalSales: totalSales.pop().totalsales});
});

router.get('/userorders/:userid', async (req, res) => {
  const userid = req.params.userid;
  const orderList = await Order.find({user: userid})
    .populate({
      path: 'orderItems',
      populate: {path: 'product', populate: 'category'},
    })
    .sort({daterOrder: -1});

  if (!orderList)
    return res
      .status(404)
      .json({success: false, message: 'Not get User order'});

  res.status(200).send(orderList);
});

module.exports = router;
