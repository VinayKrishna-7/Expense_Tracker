import { Router } from 'express';
import { getBudgets, setBudget, deleteBudget, setBudgetSchema } from '../controllers/budgetController.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.use(requireAuth);

router.get('/', getBudgets);
router.post('/', validate(setBudgetSchema), setBudget);
router.delete('/:id', deleteBudget);

export default router;
