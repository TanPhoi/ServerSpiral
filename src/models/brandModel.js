const mongoose = require('mongoose');

const BrandSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  industry: {
    type: [String], // Các ngành công nghiệp mà thương hiệu hoạt động
    default: [],
  },
  category: {
    type: [String], // Các danh mục liên quan
    default: [],
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
  },
});

const BrandModel = mongoose.model('brands', BrandSchema);
module.exports = BrandModel;
