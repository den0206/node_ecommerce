const express = require('express');
const router = express.Router();
const {checkId} = require('../db');
const Order = require('../models/order');
const OrderItem = require('../models/orderItem');

router.get('/', async (req, res) => {
  const orderList = await Order.find();
  if (!orderList)
    return res.status(500).json({success: false, message: 'No Find Orders'});

  res.send(orderList);
});

router.post('/', async (req, res) => {
  const orderItemsIds = Promise.all(
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

  const order = new Order({
    orderItems: orderItemsResolvered,
    shippingAddress1: req.body.shippingAddress1,
    shippingAddress2: req.body.shippingAddress2,
    city: req.body.city,
    zip: req.body.zip,
    country: req.body.country,
    phone: req.body.phone,
    stauts: req.body.status,
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

module.exports = router;
