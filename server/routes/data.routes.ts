import { Router } from 'express';
import { exportCsv, exportFullBackup, resetUserData } from '../controllers/dataController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

router.get('/export/csv', exportCsv);
router.get('/export/backup', exportFullBackup);
router.post('/reset', resetUserData);

export default router;
