import { Router } from 'express';
import {
  getGoals,
  createGoal,
  updateGoal,
  deleteGoal,
  contributeToGoal,
  createGoalSchema,
  updateGoalSchema,
  contributeGoalSchema,
} from '../controllers/goalController.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.use(requireAuth);

router.get('/', getGoals);
router.post('/', validate(createGoalSchema), createGoal);
router.put('/:id', validate(updateGoalSchema), updateGoal);
router.delete('/:id', deleteGoal);
router.post('/:id/contribute', validate(contributeGoalSchema), contributeToGoal);

export default router;
