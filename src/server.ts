import express from 'express';
import cors from 'cors';
import { config } from './config';
import { router } from './routes';
const app = express();

app.use(cors({
  origin: ['http://localhost:8080', 'http://127.0.0.1:8080','https://stockmarketbackend-production-b864.up.railway.app'],
}));
app.use(express.json());

app.use('/api', router);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(config.PORT, () => {
  console.log(`🚀 Server running on http://localhost:${config.PORT}`);
});
