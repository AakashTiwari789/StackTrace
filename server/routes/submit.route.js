import Router from 'express';
import { authenticateUser } from '../middlewares/auth.middleware.js';
import { submitProblem, runCode, getMySubmissions } from '../controllers/submit.controller.js';

const router = Router();

router.route('/:problemId/run').post(authenticateUser, runCode);
router.route('/:problemId/submit').post(authenticateUser, submitProblem);
router.route('/:problemId/submissions').get(authenticateUser, getMySubmissions);

export default router;