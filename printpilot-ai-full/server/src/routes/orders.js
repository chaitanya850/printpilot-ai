import { Router } from 'express';
import { z } from 'zod';
import { createOrder, deleteOrder, listOrders, updateOrderStatus } from '../services/store.js';

const router = Router();
const orderSchema = z.object({
  customer: z.string().trim().min(1, 'Customer is required').max(120),
  garment: z.enum(['T-Shirts','Hoodies','Polo Shirts','Tote Bags','Other']).default('T-Shirts'),
  color: z.string().trim().min(1).max(60).default('Black'),
  quantity: z.coerce.number().int().min(1).max(100000),
  sizes: z.string().max(200).default('Not specified'),
  printMethod: z.enum(['DTG Print','Screen Printing','Heat Transfer','Embroidery','Other']).default('DTG Print'),
  notes: z.string().max(1000).default(''),
  status: z.enum(['Pending','In Production','Ready','Delivered']).default('Pending'),
  unitCost: z.coerce.number().min(0).default(4.8),
  unitPrice: z.coerce.number().min(0).default(8)
});
router.get('/', async (req,res,next) => { try { res.json({ orders: await listOrders({ search: String(req.query.search || '').slice(0,100), status: String(req.query.status || '') }) }); } catch(e){ next(e); } });
router.post('/', async (req,res,next) => { try { const parsed = orderSchema.safeParse(req.body); if(!parsed.success) return res.status(400).json({ error: 'Please check the order fields.', details: parsed.error.flatten().fieldErrors }); const order = await createOrder(parsed.data); res.status(201).json({ order }); } catch(e){ next(e); } });
router.patch('/:id/status', async (req,res,next) => { try { const statusSchema = z.object({status:z.enum(['Pending','In Production','Ready','Delivered'])}); const parsed=statusSchema.safeParse(req.body); if(!parsed.success) return res.status(400).json({error:'Invalid status.'}); const order=await updateOrderStatus(req.params.id,parsed.data.status); if(!order) return res.status(404).json({error:'Order not found.'}); res.json({order}); } catch(e){ next(e); } });
router.delete('/:id', async (req,res,next) => { try { const deleted=await deleteOrder(req.params.id); if(!deleted) return res.status(404).json({error:'Order not found.'}); res.status(204).end(); } catch(e){ next(e); } });
export default router;
