import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
import authRoutes from './routes/auth.routes.js';
import branchRoutes from './routes/branch.routes.js';
import userRoutes from './routes/user.routes.js';
import clientRoutes from './routes/client.routes.js';
import projectRoutes from './routes/project.routes.js';
import paymentStageRoutes from './routes/paymentStage.routes.js';
import labourRoutes from './routes/labour.routes.js';
import materialRoutes from './routes/material.routes.js';
import materialItemRoutes from './routes/materialItem.routes.js';
import associateRoutes from './routes/associate.routes.js';
import associatePaymentRoutes from './routes/associatePayment.routes.js';
import billRoutes from './routes/bill.routes.js';
import expenseRoutes from './routes/expense.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import reportRoutes from './routes/report.routes.js';
import { errorMiddleware } from './middleware/error.middleware.js';

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'Buildops API' });
});

app.use('/api/auth', authRoutes);
app.use('/api/branches', branchRoutes);
app.use('/api/users', userRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/stages', paymentStageRoutes);
app.use('/api/labour', labourRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/material-items', materialItemRoutes);
app.use('/api/associates', associateRoutes);
app.use('/api/associate-payments', associatePaymentRoutes);
app.use('/api/bills', billRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportRoutes);

app.use(errorMiddleware);

export default app;
