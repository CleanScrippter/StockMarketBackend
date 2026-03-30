import express from 'express';
import cors from 'cors';
import { config } from './config';
import { router } from './routes';
const app = express();

const allowedOrigins = [
  'http://localhost:8080',
  'http://127.0.0.1:8080',
  'https://market-pulse-83.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // Postman, curl, mobile apps

    // allow localhost + exact domains
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // allow ALL vercel preview deployments
    if (origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS: ' + origin));
  },
   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
app.use(express.json());

app.use('/api', router);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(config.PORT, () => {
  console.log(`🚀 Server running on http://localhost:${config.PORT}`);
});
