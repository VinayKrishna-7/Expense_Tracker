import { Router } from 'express';
import { getCategories, createCategory, deleteCategory, createCategorySchema } from '../controllers/categoryController.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.use(requireAuth);

router.get('/', getCategories);
router.post('/', validate(createCategorySchema), createCategory);
router.delete('/:id', deleteCategory);

export default router;
