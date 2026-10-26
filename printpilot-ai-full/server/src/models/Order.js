import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, unique: true, index: true },
  customer: { type: String, required: true, trim: true, maxlength: 120 },
  garment: { type: String, enum: ['T-Shirts', 'Hoodies', 'Polo Shirts', 'Tote Bags', 'Other'], default: 'T-Shirts' },
  color: { type: String, default: 'Black', trim: true, maxlength: 60 },
  quantity: { type: Number, required: true, min: 1, max: 100000 },
  sizes: { type: String, default: 'Not specified', maxlength: 200 },
  printMethod: { type: String, enum: ['DTG Print', 'Screen Printing', 'Heat Transfer', 'Embroidery', 'Other'], default: 'DTG Print' },
  notes: { type: String, default: '', maxlength: 1000 },
  status: { type: String, enum: ['Pending', 'In Production', 'Ready', 'Delivered'], default: 'Pending' },
  unitCost: { type: Number, default: 4.8, min: 0 },
  unitPrice: { type: Number, default: 8, min: 0 },
  dueDate: { type: Date, default: null }
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);
