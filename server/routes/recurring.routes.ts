import { Router } from 'express';
import {
  getRecurring,
  createRecurring,
  updateRecurring,
  deleteRecurring,
  processRecurring,
  createRecurringSchema,
  updateRecurringSchema,
} from '../controllers/recurringController.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.use(requireAuth);

router.get('/', getRecurring);
router.post('/', validate(createRecurringSchema), createRecurring);
router.put('/:id', validate(updateRecurringSchema), updateRecurring);
router.delete('/:id', deleteRecurring);
router.post('/process', processRecurring);

export default router;
