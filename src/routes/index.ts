import { Router } from 'express';
import healthRoutes from './health.routes';
import filesRoutes from './files.routes';
import processingRoutes from './processing.routes';
import summarizeRoutes from './summarize.routes';

const router = Router();

// Mount route modules
router.use('/health', healthRoutes);
router.use('/files', filesRoutes);
router.use('/process', processingRoutes);
router.use('/summarize', summarizeRoutes);

// Legacy route compatibility
router.use('/download/:filename', filesRoutes);

export default router;
