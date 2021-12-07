const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  name: {type: String, required: true},
  email: {type: String, required: true, unique: true},
  passwordHash: {type: String, required: true},
  street: {type: String, default: ''},
  apartment: {type: String, default: ''},
  city: {type: String, default: ''},
  zip: {type: String, default: ''},
  country: {type: String, default: ''},
  phone: {type: Number, required: true},
  iAdmin: {type: Boolean, default: false},
});

userSchema.virtual('id').get(function () {
  if (this._id) return this._id.toHexString();
});

userSchema.set('toJSON', {
  virtuals: true,
});

const User = mongoose.model('User', userSchema);
module.exports = User;