import express from 'express';
import cors from 'cors';
import { Logger } from '../utils/logger';
import { errorHandler, notFoundHandler } from '../middleware';
import router from '../routes';

const app = express();
const port = process.env.PORT || 3000;

// Basic middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/', router);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
app.listen(port, () => {
  Logger.success('Server', 'start', `PDF Resumer running on port ${port}`);
  Logger.info('Server', 'start', `Health: http://localhost:${port}/health`);
});

export default app;
