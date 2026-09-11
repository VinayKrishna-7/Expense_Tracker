import { Router } from 'express';
import {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  bulkImportTransactions,
  createTransactionSchema,
  updateTransactionSchema,
  bulkImportSchema,
} from '../controllers/transactionController.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.use(requireAuth);

router.get('/', getTransactions);
router.post('/', validate(createTransactionSchema), createTransaction);
router.put('/:id', validate(updateTransactionSchema), updateTransaction);
router.delete('/:id', deleteTransaction);
router.post('/bulk', validate(bulkImportSchema), bulkImportTransactions);

export default router;
