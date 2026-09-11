import { Router } from 'express';
import {
  getSubscriptions,
  createSubscription,
  updateSubscription,
  deleteSubscription,
  createSubscriptionSchema,
  updateSubscriptionSchema,
} from '../controllers/subscriptionController.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.use(requireAuth);

router.get('/', getSubscriptions);
router.post('/', validate(createSubscriptionSchema), createSubscription);
router.put('/:id', validate(updateSubscriptionSchema), updateSubscription);
router.delete('/:id', deleteSubscription);

export default router;
