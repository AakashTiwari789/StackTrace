import Router from 'express';
import { authenticateUser } from '../middlewares/auth.middleware.js';
import { submitProblem, runCode } from '../controllers/submit.controller.js';

const router = Router();

router.route('/:problemId/run').post(authenticateUser, runCode);
router.route('/:problemId/submit').post(authenticateUser, submitProblem);

export default router;