import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import ordersRouter from './routes/orders.js';
import aiRouter from './routes/ai.js';
import { isMongoConnected } from './services/store.js';

const app=express();
const port=Number(process.env.PORT || 5000);
app.use(cors({origin: process.env.CLIENT_ORIGIN ? process.env.CLIENT_ORIGIN.split(',').map(s=>s.trim()) : true}));
app.use(express.json({limit:'1mb'}));
app.get('/api/health',(_req,res)=>res.json({ok:true,service:'PrintPilot AI API',database:isMongoConnected()?'mongodb':'in-memory-demo',timestamp:new Date().toISOString()}));
app.use('/api/orders',ordersRouter);
app.use('/api/ai',aiRouter);
app.post('/api/estimates',(req,res)=>{
 const {garment='T-Shirts',quantity,printMethod='DTG Print',unitCost,unitPrice}=req.body||{};
 if(!Number.isInteger(Number(quantity))||Number(quantity)<1||Number(quantity)>100000) return res.status(400).json({error:'Quantity must be an integer from 1 to 100000.'});
 const defaults={'T-Shirts':{cost:4.8,price:8},'Hoodies':{cost:7.5,price:13.6},'Polo Shirts':{cost:6,price:12},'Tote Bags':{cost:3,price:6},'Other':{cost:5,price:9}};
 const base=defaults[garment]||defaults.Other; const methodMultiplier={'DTG Print':1,'Screen Printing':0.8,'Heat Transfer':0.9,'Embroidery':1.35,'Other':1};
 const qty=Number(quantity), cost=Number.isFinite(Number(unitCost))?Number(unitCost):base.cost*(methodMultiplier[printMethod]||1), price=Number.isFinite(Number(unitPrice))?Number(unitPrice):base.price;
 if(cost<0||price<0) return res.status(400).json({error:'Cost and price cannot be negative.'});
 const totalCost=cost*qty,sellingPrice=price*qty,profit=sellingPrice-totalCost;
 res.json({garment,quantity:qty,unitCost:cost,unitPrice:price,totalCost,sellingPrice,profit,margin:sellingPrice?profit/sellingPrice*100:0,currency:'MYR',assumptions:'Illustrative defaults only; replace with actual shop costs.'});
});
app.use((err,_req,res,_next)=>{ console.error(err); res.status(500).json({error:'Unexpected server error. Check the server terminal for details.'}); });
if(process.env.MONGODB_URI){ mongoose.connect(process.env.MONGODB_URI).then(()=>console.log('MongoDB connected')).catch(err=>console.error('MongoDB connection failed; using in-memory demo store:',err.message)); }
app.listen(port,()=>console.log(`PrintPilot AI API running at http://localhost:${port}`));
