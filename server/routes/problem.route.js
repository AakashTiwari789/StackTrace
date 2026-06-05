import Router from 'express';
import { authenticateAdmin } from '../middlewares/auth.middleware.js';
import { createNewProblem, updateProblem, getAllProblems, getProblemBySlug } from '../controllers/problem.controller.js';

const router = Router();

router.route('/create').post(authenticateAdmin, createNewProblem);

router.route('/update/:problemId').put(authenticateAdmin, updateProblem);

router.route('/').get(getAllProblems);

router.route('/:slug').get(getProblemBySlug);

export default router;