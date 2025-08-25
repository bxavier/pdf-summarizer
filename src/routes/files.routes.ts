import { Router } from 'express';
import { listFiles, downloadFile } from '../controllers';

const router = Router();
router.get('/', listFiles);
router.get('/download/:filename', downloadFile);

export default router;
