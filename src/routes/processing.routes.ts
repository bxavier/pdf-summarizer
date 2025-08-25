import { Router } from 'express';
import { processDocument } from '../controllers';
import { uploadSingle } from '../middleware';

const router = Router();
router.post('/', uploadSingle, processDocument);

export default router;
