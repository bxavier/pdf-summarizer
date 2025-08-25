import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { Logger } from '../utils/logger';
import { errorHandler, notFoundHandler } from '../middleware';
import router from '../routes';
import { swaggerSpec } from '../config/swagger';

const app = express();
const port = process.env.PORT || 3000;

// Basic middleware
app.use(cors());
app.use(express.json());

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'PDF Resumer API Documentation'
}));

// JSON spec endpoint
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Routes
app.use('/', router);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
app.listen(port, () => {
  Logger.success('Server', 'start', `PDF Resumer running on port ${port}`);
  Logger.info('Server', 'start', `Health: http://localhost:${port}/health`);
  Logger.info('Server', 'start', `API Documentation: http://localhost:${port}/api-docs`);
});

export default app;
