import mongoose from 'mongoose';
import Order from '../models/Order.js';

let memoryOrders = [
  { _id: 'demo1008', orderNumber: 'PP-1008', customer: 'ABC Clothing', garment: 'T-Shirts', color: 'Black', quantity: 100, sizes: '50 M, 50 L', printMethod: 'DTG Print', status: 'In Production', unitCost: 4.8, unitPrice: 8, createdAt: new Date().toISOString() },
  { _id: 'demo1007', orderNumber: 'PP-1007', customer: 'Sunrise Apparel', garment: 'Hoodies', color: 'Navy', quantity: 50, sizes: 'Mixed sizes', printMethod: 'Screen Printing', status: 'Pending', unitCost: 7.5, unitPrice: 13.6, createdAt: new Date(Date.now()-86400000).toISOString() },
  { _id: 'demo1006', orderNumber: 'PP-1006', customer: 'Tech Solutions', garment: 'Polo Shirts', color: 'White', quantity: 200, sizes: 'Mixed sizes', printMethod: 'Embroidery', status: 'Ready', unitCost: 6, unitPrice: 12, createdAt: new Date(Date.now()-2*86400000).toISOString() },
  { _id: 'demo1005', orderNumber: 'PP-1005', customer: 'Creative Minds', garment: 'T-Shirts', color: 'Red', quantity: 75, sizes: 'Mixed sizes', printMethod: 'Heat Transfer', status: 'In Production', unitCost: 4.5, unitPrice: 6.93, createdAt: new Date(Date.now()-3*86400000).toISOString() },
  { _id: 'demo1004', orderNumber: 'PP-1004', customer: 'Bright Studio', garment: 'Hoodies', color: 'Black', quantity: 30, sizes: 'Mixed sizes', printMethod: 'Screen Printing', status: 'Delivered', unitCost: 7, unitPrice: 14, createdAt: new Date(Date.now()-4*86400000).toISOString() }
];
const useMongo = () => mongoose.connection.readyState === 1;
export const isMongoConnected = useMongo;
export async function listOrders({ search = '', status = '' } = {}) {
  if (useMongo()) {
    const query = {};
    if (status) query.status = status;
    if (search) query.$or = [{ customer: { $regex: search, $options: 'i' } }, { orderNumber: { $regex: search, $options: 'i' } }, { garment: { $regex: search, $options: 'i' } }];
    return Order.find(query).sort({ createdAt: -1 }).lean();
  }
  return memoryOrders.filter(o => (!status || o.status === status) && (!search || `${o.customer} ${o.orderNumber} ${o.garment}`.toLowerCase().includes(search.toLowerCase()))).sort((a,b) => new Date(b.createdAt)-new Date(a.createdAt));
}
export async function createOrder(data) {
  const orderNumber = `PP-${Date.now().toString().slice(-7)}`;
  if (useMongo()) return (await Order.create({ ...data, orderNumber })).toObject();
  const order = { ...data, orderNumber, _id: `local-${Date.now()}-${Math.random().toString(16).slice(2,6)}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  memoryOrders.unshift(order); return order;
}
export async function updateOrderStatus(id, status) {
  if (useMongo()) return Order.findByIdAndUpdate(id, { status }, { new: true, runValidators: true }).lean();
  const order = memoryOrders.find(o => o._id === id); if (!order) return null;
  order.status = status; order.updatedAt = new Date().toISOString(); return order;
}
export async function deleteOrder(id) {
  if (useMongo()) return (await Order.findByIdAndDelete(id).lean()) !== null;
  const before = memoryOrders.length; memoryOrders = memoryOrders.filter(o => o._id !== id); return memoryOrders.length < before;
}
