import Router from 'express';
import { authenticateAdmin, optionalAuthenticateUser } from '../middlewares/auth.middleware.js';
import { createNewProblem, updateProblem, getAllProblems, getProblemBySlug, togglePublishProblem, togglePremiumProblem, getTestCases } from '../controllers/problem.controller.js';

const router = Router();

router.route('/create').post(authenticateAdmin, createNewProblem);

router.route('/update/:problemId').put(authenticateAdmin, updateProblem);

router.route('/:problemId/toggle-publish').patch(authenticateAdmin, togglePublishProblem);

router.route('/:problemId/toggle-premium').patch(authenticateAdmin, togglePremiumProblem);

router.route('/:slug/test-cases').get(authenticateAdmin, getTestCases);

router.route('/').get(getAllProblems);

router.route('/:slug').get(optionalAuthenticateUser, getProblemBySlug);

export default router;