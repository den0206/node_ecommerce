const express = require('express');
const app = express();
const dotenv = require('dotenv');
const morgan = require('morgan');
const cors = require('cors');
const {connection} = require('./db');

dotenv.config();

app.use(cors());
app.options('*', cors());
app.use(express.json());
app.use(morgan('tiny'));

/// db connext
connection();

/// require
const productsRoute = require('./routes/product_route');
const categoryRoute = require('./routes/category_route');
const userRoute = require('./routes/user_route');

/// routes
const v1 = process.env.API_URL;
app.use(`${v1}/products`, productsRoute);
app.use(`${v1}/categories`, categoryRoute);
app.use(`${v1}/users`, userRoute);
app.listen(3000, () => {
  console.log('Server running');
});
