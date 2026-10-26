import { Router } from 'express';
import { z } from 'zod';
import { extractOrder, getAiStatus } from '../services/ai.js';
import { listOrders } from '../services/store.js';
const router = Router();
router.get('/status', async (_req,res) => res.json(await getAiStatus()));
router.post('/extract-order', async (req,res) => {
  const parsed=z.object({text:z.string().trim().min(8).max(2000)}).safeParse(req.body);
  if(!parsed.success) return res.status(400).json({error:'Enter an order description of at least 8 characters.'});
  res.json(await extractOrder(parsed.data.text));
});
router.post('/production-summary', async (req,res) => {
  const orders=await listOrders({});
  const pending=orders.filter(o=>o.status==='Pending'); const production=orders.filter(o=>o.status==='In Production'); const ready=orders.filter(o=>o.status==='Ready');
  const overdue=orders.filter(o=>o.dueDate && new Date(o.dueDate)<new Date() && o.status!=='Delivered');
  const summary={totalOrders:orders.length,pending:pending.length,inProduction:production.length,ready:ready.length,overdue:overdue.length,attention:overdue.map(o=>({orderNumber:o.orderNumber,customer:o.customer,status:o.status})),suggestion: overdue.length ? 'Review overdue orders first and contact the affected customers.' : pending.length ? 'Confirm artwork and stock for pending orders before scheduling production.' : 'No immediate bottleneck detected from current order statuses.'};
  res.json({summary,provider:'deterministic-summary',note:'This summary is calculated from stored order data; no LLM is used for these counts.'});
});
export default router;
