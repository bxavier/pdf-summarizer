import { Router } from 'express';
import { summarizeHtml } from '../controllers';

const router = Router();
router.post('/', summarizeHtml);

export default router;
