import { Router } from 'express';
import {
  getAccounts,
  createAccount,
  updateAccount,
  deleteAccount,
  transferBetweenAccounts,
  createAccountSchema,
  updateAccountSchema,
  transferSchema,
} from '../controllers/accountController.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.use(requireAuth);

router.get('/', getAccounts);
router.post('/', validate(createAccountSchema), createAccount);
router.put('/:id', validate(updateAccountSchema), updateAccount);
router.delete('/:id', deleteAccount);
router.post('/transfer', validate(transferSchema), transferBetweenAccounts);

export default router;
